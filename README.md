# 💼 Sistema de Recebimento

O **Sistema de Recebimento** é uma aplicação web completa para registro de entrada de produtos em estoque, com integração ao Firebase e Google Sheets. Criado para uso interno em ambiente corporativo, o sistema permite que colaboradores façam login seguro, cadastrem produtos com fotos e tenham esses dados armazenados em tempo real na nuvem — com cópia automática em planilhas Google.

Este projeto foi desenvolvido com **HTML, CSS e JavaScript puro (Vanilla)**, utilizando Firebase Authentication, Firestore e Google Apps Script.

[🚀 Acesse o sistema](https://sistema-recebimento.vercel.app)

---

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=flat&logo=google-sheets&logoColor=white)

---

# 🛠️ Funcionalidades principais

- 🔐 **Login seguro com Firebase Authentication**
- 🧾 **Cadastro de produtos com:**
  - Código
  - Descrição (autopreenchida via Google Sheets)
  - Fornecedor (autopreenchido)
  - Quantidade
  - Foto(s)
- 📷 Upload automático das fotos para **ImgBB**
- ☁️ Armazenamento no **Firebase Firestore**
- 📊 Registro paralelo na **planilha Google Sheets**
- ⏱️ Registro de data/hora e usuário que fez o recebimento
- ✅ Validação de campos obrigatórios

---

# 🔌 Tecnologias e Integrações

| Tecnologia       | Uso                                                        |
|------------------|------------------------------------------------------------|
| **HTML5/CSS3**   | Interface responsiva e limpa                               |
| **JavaScript**   | Lógica do formulário, manipulação de DOM e integração APIs |
| **Firebase Auth**| Login e recuperação de senha                               |
| **Firestore**    | Armazenamento de dados                                     |
| **Google Sheets**| Backup dos recebimentos via Apps Script                    |
| **Cloudinary API**    | Upload e hosting das imagens de produtos                   |

---

# 🔄 Fluxo de funcionamento

1. Usuário faz login
2. Preenche o formulário de recebimento
3. Faz upload da(s) foto(s)
4. Os dados são salvos em:
   - Firebase Firestore (tempo real)
   - Google Sheets (via WebApp do Apps Script)
5. Mensagem de sucesso ou erro é exibida

---

# 🧪 Possíveis melhorias

- Upload de múltiplas imagens para cada item
- Filtros por fornecedor ou usuário
- Login com perfis de acesso (admin/colaborador)
- Versão mobile dedicada

---

# 📑 Planilha integrada

- Nome: **Planilha de Recebimentos**
- Aba: `Recebidos`
- Link: [📄 Acessar no Google Sheets](https://docs.google.com/spreadsheets/d/11781xe4rt2c89GIuaO1UqBDSNhbV-FQ7t9flOBTTc1w/edit#gid=0)

---

# 🧠 Aprendizados aplicados

- Validação de formulário com feedback em tempo real
- Manipulação avançada de arquivos com `FileReader`
- Upload de imagens via API externa
- Integração frontend com dois backends diferentes (Firebase + Google Sheets)
- CORS, Headers HTTP e JSON
- Tratamento de erros com `try/catch`

---

# 👨‍💻 Sobre o projeto

Este projeto foi desenvolvido como parte dos meus estudos em **Análise e Desenvolvimento de Sistemas** na **Afya**, com objetivo de aprender na prática como integrar front-end com serviços de backend reais, como Firebase e Google Sheets, sem depender de frameworks ou bibliotecas externas.

---

# 📫 Contato

- GitHub: [@bnocrv](https://github.com/bnocrv)
- LinkedIn: [@bnocrv](https://linkedin.com/in/bnocrv)

---

# 📅 Últimas atualizações (Ago/2025)

- Integração funcional com planilha Google Sheets
- Formulário limpa após envio com sucesso
- Implementado login com validação de e-mail/senha
- Substituição do armazenamento das imagens no ImgBB pelo Cloudnary 


