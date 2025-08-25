// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdtcu70qJv57ODzNpB_xicUh46TB7PPEg",
  authDomain: "recebimentoapp-b43cd.firebaseapp.com",
  projectId: "recebimentoapp-b43cd",
  storageBucket: "recebimentoapp-b43cd.appspot.com",
  messagingSenderId: "3209222094",
  appId: "1:3209222094:web:7b823b841c055a46217d9f",
  measurementId: "G-97F8FEQVZL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
