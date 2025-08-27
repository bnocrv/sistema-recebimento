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
// pega o form e o lugar onde a gente mostra erros
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault(); // evita o reload da página

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // login deu certo
      const user = userCredential.user;
      loginError.textContent = ""; // limpa mensagem de erro

      // esconde o container de login e mostra o de recebimento
      document.getElementById("login-container").style.display = "none";
      document.getElementById("recebimento-container").style.display = "block";

      // coloca o email do usuário no campo oculto pra usar depois
      document.getElementById("usuario-logado").value = user.email;

      // aqui não tem alert, login rola direto e tranquilo
    })
    .catch(() => {
      // se der erro, mostra mensagem de erro ali embaixo
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
    recebimentoMsg.textContent = "Salvando recebimento...";

    const fotosURLs = [];

    // Faz upload das fotos uma a uma para ImgBB (base64)
    for (const fotoFile of fotosFiles) {
      const reader = new FileReader();
      const fotoURL = await new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64Image = reader.result.split(",")[1];

          try {
            const formData = new FormData();
            formData.append("file", `data:image/jpeg;base64,${base64Image}`);
            formData.append("upload_preset", "recebimento_fotos");

            const response = await fetch(
              "https://api.cloudinary.com/v1_1/dmpqzayaa/image/upload",
              {
                method: "POST",
                body: formData,
              }
            );

            const result = await response.json();
            if (result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject("Erro no upload do Cloudinary");
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

    // Salva os dados no Firebase Firestore
    await addDoc(collection(db, "recebimentos"), {
      codigo,
      descricao,
      fornecedor,
      quantidade: Number(quantidade),
      fotosURLs,
      criadoEm: serverTimestamp(),
      usuario,
    });

    // Também manda os dados para planilha via Apps Script
    const webAppURL =
      "https://script.google.com/macros/s/AKfycbxYI5909qoNVkDnwQNBdzhw4EjKFIMDZUrvarPkFO1pQV8ykkPkFiqbzOrVTfNxqB-1/exec";

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

      // mantém o email do usuário preenchido para próximos envios
      document.getElementById("usuario-logado").value = usuario;
    } else {
      throw new Error(respostaTexto);
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    recebimentoMsg.style.color = "red";
    recebimentoMsg.textContent = "Erro ao salvar recebimento. Tente novamente.";
  }
});

// Botão pra trocar tema claro/escuro
const themeToggle = document.createElement("button");
themeToggle.id = "theme-toggle";
themeToggle.textContent = "🌙 Tema Escuro";

document.body.appendChild(themeToggle);

// Carrega tema salvo no localStorage, se tiver
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.toggle("dark", savedTheme === "dark");
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

// Evento do botão que troca o tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
