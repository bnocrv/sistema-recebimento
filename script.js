// ========== IMPORTS FIREBASE AUTH, FIRESTORE, STORAGE ===============
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import "./firebase-config.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// ========== LOGIN ==========
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      loginError.textContent = "";
      alert("Login realizado com sucesso!");
      document.getElementById("login-container").style.display = "none";
      document.getElementById("recebimento-container").style.display = "block";
      document.getElementById("usuario-logado").value = user.email;
    })
    .catch(() => {
      loginError.textContent = "E-mail ou senha inválidos.";
    });
});

// ========== RECUPERAR SENHA ==========
const forgotPasswordLink = document.getElementById("esqueceu-senha");
const senhaMsg = document.getElementById("senha-msg");

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  if (!email) {
    senhaMsg.style.color = "red";
    senhaMsg.textContent = "Digite seu e-mail para redefinir a senha.";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      senhaMsg.style.color = "green";
      senhaMsg.textContent = "E-mail de redefinição enviado com sucesso.";
    })
    .catch(() => {
      senhaMsg.style.color = "red";
      senhaMsg.textContent = "Erro ao enviar e-mail. Verifique o endereço.";
    });
});

// ========== CARREGAR PLANILHA DE PRODUTOS ==========
const sheetId = "14BlYzjLKGZZn_7tv3ECjDz-9xr1hyDS4T7_3CZ9f-qY";
const sheetName = "COD-DESC-FORNEC";
const apiKey = "AIzaSyBJExJSW-CCxP4711nBpzar6cOcT-qVgtA";

const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
  sheetName
)}?key=${apiKey}`;

let produtosDB = {};

async function carregarProdutosDoSheet() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.json();
    const rows = data.values || [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const codigo = row[0]?.trim();
      const descricao = row[1]?.trim() || "";
      const fornecedor = row[2]?.trim() || "";
      if (codigo) produtosDB[codigo] = { descricao, fornecedor };
    }
  } catch (error) {
    console.error("Erro ao carregar planilha:", error);
  }
}

carregarProdutosDoSheet();

// ========== PREENCHIMENTO AUTOMÁTICO ==========
const codigoProdutoInput = document.getElementById("codigo-produto");
const descricaoProdutoInput = document.getElementById("descricao-produto");
const fornecedorProdutoInput = document.getElementById("fornecedor-produto");

codigoProdutoInput.addEventListener("input", () => {
  const codigo = codigoProdutoInput.value.trim();
  if (produtosDB[codigo]) {
    descricaoProdutoInput.value = produtosDB[codigo].descricao;
    fornecedorProdutoInput.value = produtosDB[codigo].fornecedor;
  } else {
    descricaoProdutoInput.value = "";
    fornecedorProdutoInput.value = "";
  }
});

// ========== FORMULÁRIO DE RECEBIMENTO ==========
const recebimentoForm = document.getElementById("recebimento-form");
const recebimentoMsg = document.getElementById("recebimento-msg");

recebimentoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const codigo = codigoProdutoInput.value.trim();
  const descricao = descricaoProdutoInput.value;
  const fornecedor = fornecedorProdutoInput.value;
  const quantidade = document.getElementById("quantidade").value;
  const fotosFiles = document.getElementById("foto-recebimento").files;
  const usuario = document.getElementById("usuario-logado").value;

  if (!codigo || !quantidade || quantidade <= 0 || fotosFiles.length === 0) {
    recebimentoMsg.style.color = "red";
    recebimentoMsg.textContent = "Preencha todos os campos obrigatórios.";
    return;
  }

  try {
    recebimentoMsg.style.color = "black";
    recebimentoMsg.textContent = "Salvando recebimento...";

    const fotosURLs = [];

    for (const fotoFile of fotosFiles) {
      const reader = new FileReader();
      const fotoURL = await new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64Image = reader.result.split(",")[1];

          try {
            const response = await fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              body: new URLSearchParams({
                key: "aa3ef7357e89fe7032ebeb4185be9229",
                image: base64Image,
              }),
            });

            const result = await response.json();
            if (result.success) {
              resolve(result.data.url);
            } else {
              reject("Erro no upload do ImgBB");
            }
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(fotoFile);
      });

      fotosURLs.push(fotoURL);
    }

    // 🔥 Salva no Firebase
    await addDoc(collection(db, "recebimentos"), {
      codigo,
      descricao,
      fornecedor,
      quantidade: Number(quantidade),
      fotosURLs,
      criadoEm: serverTimestamp(),
      usuario,
    });

    // ========== APP SCRIPT ==========
    const webAppURL =
      "https://script.google.com/macros/s/AKfycbzjGIfsc-SlWNjxwDzkWTgAWIR5C6IvQ2qLASy1uINLqT8g6VA8Cx9FMqssyLK7LWsZ/exec";

    const respostaPlanilha = await fetch(webAppURL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        codigo,
        descricao,
        fornecedor,
        quantidade: Number(quantidade),
        usuario,
        fotoURL: fotosURLs[0] || "",
        dataHora: new Date().toLocaleString("pt-BR"),
      }),
    });

    const respostaTexto = await respostaPlanilha.text();
    console.log("Resposta do Apps Script:", respostaTexto);

    if (respostaTexto.includes("OK")) {
      recebimentoMsg.style.color = "green";
      recebimentoMsg.textContent = "Recebimento salvo com sucesso!";
      recebimentoForm.reset();
      descricaoProdutoInput.value = "";
      fornecedorProdutoInput.value = "";
    } else {
      throw new Error(respostaTexto);
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    recebimentoMsg.style.color = "red";
    recebimentoMsg.textContent = "Erro ao salvar recebimento. Tente novamente.";
  }
});
