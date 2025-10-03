// ===================================================================
// main.js - VERSÃO COMPLETA E CORRIGIDA (COM AUTENTICAÇÃO)
// Data: 03 de Outubro de 2025
// ===================================================================


// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// **NOVO:** Importa as funções de autenticação
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Sua nova configuração do Firebase (projeto v2)
const firebaseConfig = {
  apiKey: "AIzaSyB-lXZDVgx-sbcm8QbmWy2lQ8tgDmFNKr8",
  authDomain: "pixologoexisto-v2.firebaseapp.com",
  projectId: "pixologoexisto-v2",
  storageBucket: "pixologoexisto-v2.appspot.com",
  messagingSenderId: "816053289271",
  appId: "1:816053289271:web:bbe46d1b0fb5bee1fd5ab2"
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// **NOVO:** Inicializa o serviço de autenticação
const auth = getAuth(app);


// --- 2. LÓGICA DE AUTENTICAÇÃO (NOVO BLOCO) ---

// Lógica para a página de LOGIN
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = formLogin.email.value;
        const senha = formLogin.senha.value;
        const erroLogin = document.getElementById('login-error');

        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                // Login bem-sucedido, redireciona para o painel admin
                window.location.href = '/admin.html';
            })
            .catch((error) => {
                console.error("Erro no login:", error);
                erroLogin.textContent = "Email ou senha inválidos.";
            });
    });
}

// Lógica para o botão de SAIR no painel admin
const botaoLogout = document.getElementById('botao-logout');
if (botaoLogout) {
    botaoLogout.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Logout bem-sucedido, redireciona para a página de login
            window.location.href = '/login.html';
        }).catch((error) => {
            console.error("Erro no logout:", error);
        });
    });
}

// GUARDIÃO: Protege a página de admin e redireciona se não estiver logado
// Este código roda em todas as páginas
onAuthStateChanged(auth, (user) => {
    // Se o usuário não está logado E está tentando acessar a página de admin
    if (!user && window.location.pathname.includes('/admin.html')) {
        // Redireciona para o login
        console.log("Usuário não autenticado, redirecionando para login.");
        window.location.href = '/login.html';
    }
});


// --- 3. FUNÇÕES DE UI (INTERFACE DO USUÁRIO) ---

function criarLightbox(imageUrl) {
    // ... (código da lightbox, sem alterações)
}


// --- 4. FUNÇÕES DE DADOS (LÓGICA DO FIREBASE PARA O SITE PÚBLICO) ---

function criarCartaoArtista(artista) {
    // ... (código para criar cartão de artista, sem alterações)
}

async function carregarArtistasNoCarrossel() {
    // ... (código do carrossel dinâmico, sem alterações)
}

async function carregarArtistasRecomendados() {
    // ... (código dos artistas recomendados, sem alterações)
}

async function carregarGaleriaIndividual() {
    // ... (código da galeria individual, sem alterações)
}

async function carregarPaginaDeArtistas() {
    // ... (código da página de todos os artistas, sem alterações)
}


// --- 5. ROTEADOR (LÓGICA DA SPA PARA O SITE PÚBLICO) ---
const routes = {
    '/home': '/pages/home.html',
    '/artistas': '/pages/artistas.html',
    '/quem-somos': '/pages/quem-somos.html',
    '/onde-atuamos': '/pages/onde-atuamos.html',
    '/galeria': '/pages/galeria.html'
};

const loadContent = async () => {
    const contentDiv = document.getElementById('app-content');
    // Se não estivermos na página principal (que tem o #app-content), não faz nada.
    if (!contentDiv) return;

    const path = window.location.hash.substring(1) || '/home';
    
    let routeFile;
    if (path.startsWith('/galeria/')) {
        routeFile = routes['/galeria'];
    } else {
        routeFile = routes[path] || '/pages/404.html';
    }

    try {
        const response = await fetch(routeFile);
        const html = await response.text();
        contentDiv.innerHTML = html;

        if (path.startsWith('/galeria/')) {
            carregarGaleriaIndividual();
        } else if (path === '/home') {
            carregarArtistasNoCarrossel();
            carregarArtistasRecomendados();
        } else if (path === '/artistas') {
            carregarPaginaDeArtistas();
        }

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        contentDiv.innerHTML = '<h1>Erro ao carregar a página.</h1>';
    }
};


// --- 6. PONTO DE ENTRADA (INICIALIZAÇÃO DO SITE PÚBLICO) ---
function initializeRouter() {
    window.addEventListener('hashchange', loadContent);
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    }
    loadContent();
}

// O código do roteador só deve iniciar se estivermos na página principal da SPA
// Verificamos pela existência do elemento #app-content
if (document.getElementById('app-content')) {
    document.addEventListener('DOMContentLoaded', initializeRouter);
}