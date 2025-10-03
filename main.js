// ===================================================================
// main.js - VERSÃO COMPLETA (COM UPLOAD PARA O CLOUDINARY)
// Data: 03 de Outubro de 2025
// ===================================================================


// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// **ATUALIZADO:** Adicionado 'addDoc' para salvar novos artistas
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Sua configuração do Firebase (projeto v2)
const firebaseConfig = {
  apiKey: "AIzaSyB-lXZDVgx-sbcm8QbmWy2lQ8tgDmFNKr8",
  authDomain: "pixologoexisto-v2.firebaseapp.com",
  projectId: "pixologoexisto-v2",
  storageBucket: "pixologoexisto-v2.appspot.com",
  messagingSenderId: "816053289271",
  appId: "1:816053289271:web:bbe46d1b0fb5bee1fd5ab2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// --- 2. LÓGICA DE AUTENTICAÇÃO E PAINEL DE ADMIN ---

// Lógica para a página de LOGIN
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = formLogin.email.value;
        const senha = formLogin.senha.value;
        const erroLogin = document.getElementById('login-error');
        signInWithEmailAndPassword(auth, email, senha)
            .then(() => window.location.href = '/admin.html')
            .catch((error) => erroLogin.textContent = "Email ou senha inválidos.");
    });
}

// Lógica para o botão de SAIR no painel admin
const botaoLogout = document.getElementById('botao-logout');
if (botaoLogout) {
    botaoLogout.addEventListener('click', () => {
        signOut(auth).then(() => window.location.href = '/login.html');
    });
}

// GUARDIÃO: Protege a página de admin
onAuthStateChanged(auth, (user) => {
    if (!user && window.location.pathname.includes('/admin.html')) {
        window.location.href = '/login.html';
    }
});

// **NOVO:** Lógica do formulário de ADICIONAR ARTISTA
const formAddArtista = document.getElementById('form-add-artista');
if (formAddArtista) {
    formAddArtista.addEventListener('submit', async (e) => {
        e.preventDefault();

        const botaoSalvar = document.getElementById('botao-salvar-artista');
        const uploadStatus = document.getElementById('upload-status');

        const nome = document.getElementById('artista-nome').value;
        const imagemArquivo = document.getElementById('artista-imagem').files[0];
        const instagramHandle = document.getElementById('artista-instagram').value;
        const categoriasInput = document.getElementById('artista-categorias').value;

        if (!nome || !imagemArquivo) {
            uploadStatus.textContent = 'Nome e Imagem são obrigatórios.';
            uploadStatus.style.color = 'red';
            return;
        }

        botaoSalvar.disabled = true;
        uploadStatus.textContent = 'Enviando imagem para o Cloudinary...';
        uploadStatus.style.color = 'orange';

        const formData = new FormData();
        formData.append('file', imagemArquivo);
        formData.append('upload_preset', 'artisas_uploads');

        const CLOUD_NAME = 'dj053fl2q';
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        try {
            // 1. Envia a imagem para o Cloudinary
            const response = await fetch(uploadUrl, { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message || 'Falha no upload.');
            
            const imageUrl = data.secure_url;
            uploadStatus.textContent = 'Imagem enviada! Salvando no banco de dados...';

            // 2. Prepara os dados para salvar no Firestore
            const artistaDoc = {
                nome: nome,
                imageUrl: imageUrl,
                instagramHandle: instagramHandle,
                instagramLink: `https://www.instagram.com/${instagramHandle.replace('@', '')}`,
                categoria: categoriasInput.split(',').map(item => item.trim().toLowerCase()).filter(item => item),
                imagens: []
            };
            
            // 3. Adiciona o novo artista no Firestore
            await addDoc(collection(db, 'artistas'), artistaDoc);

            uploadStatus.textContent = 'Artista adicionado com sucesso!';
            uploadStatus.style.color = 'green';
            formAddArtista.reset();

        } catch (error) {
            console.error("Erro no processo de upload:", error);
            uploadStatus.textContent = `Erro: ${error.message}`;
            uploadStatus.style.color = 'red';
        } finally {
            botaoSalvar.disabled = false;
        }
    });
}


// --- 3. FUNÇÕES DE UI (INTERFACE DO USUÁRIO - SITE PÚBLICO) ---

function criarLightbox(imageUrl) {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    const closeButton = document.createElement('span');
    closeButton.id = 'lightbox-close';
    closeButton.innerHTML = '&times;';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.id = 'lightbox-image';
    overlay.appendChild(closeButton);
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    const closeLightbox = () => document.body.removeChild(overlay);
    overlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', onEsc);
        }
    });
}


// --- 4. FUNÇÕES DE DADOS (LÓGICA DO FIREBASE PARA O SITE PÚBLICO) ---

function criarCartaoArtista(artista) {
    const link = document.createElement('a');
    link.href = `#/galeria/${artista.id}`; 
    link.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = artista.imageUrl; 
    img.alt = `Foto do artista ${artista.nome}`;
    img.className = 'gallery-image';
    img.loading = 'lazy';
    const nome = document.createElement('p');
    nome.textContent = artista.nome;
    nome.className = 'artist-card-name';
    link.appendChild(img);
    link.appendChild(nome);
    return link;
}

async function carregarArtistasNoCarrossel() {
    const swiperWrapper = document.querySelector('.artistas-slider .swiper-wrapper');
    if (!swiperWrapper) return;
    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        swiperWrapper.innerHTML = '';
        snapshot.forEach(doc => {
            const artista = { id: doc.id, ...doc.data() };
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<div class="container-bloco"><div class="bloco-imagens"><a href="#/galeria/${artista.id}"><img src="${artista.imageUrl}" alt="Imagem de ${artista.nome}"></a></div><p class="legenda-galeria">Galeria ${artista.nome}</p></div>`;
            swiperWrapper.appendChild(slide);
        });
        new Swiper('.artistas-slider', {
            loop: snapshot.size > 3, // Ativa o loop só se tiver slides suficientes
            speed: 1500,
            breakpoints: { 320: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    } catch (error) { console.error("Erro ao carregar artistas no carrossel:", error); }
}

async function carregarArtistasRecomendados() {
    const recomendadosGrid = document.getElementById('recomendados-grid');
    if (!recomendadosGrid) return;
    recomendadosGrid.innerHTML = '<p>Carregando...</p>';
    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        let todosArtistas = [];
        snapshot.forEach(doc => todosArtistas.push({ id: doc.id, ...doc.data() }));
        todosArtistas.sort(() => 0.5 - Math.random());
        const selecionados = todosArtistas.slice(0, 4);
        recomendadosGrid.innerHTML = '';
        selecionados.forEach(artista => recomendadosGrid.appendChild(criarCartaoArtista(artista)));
    } catch (error) { console.error("Erro ao buscar artistas recomendados:", error); recomendadosGrid.innerHTML = '<p>Erro ao carregar artistas.</p>'; }
}

async function carregarGaleriaIndividual() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) return;
    try {
        const pathParts = window.location.hash.split('/');
        const artistaId = pathParts[2];
        if (!artistaId) throw new Error("ID do artista não encontrado na URL.");
        const docRef = doc(db, 'artistas', artistaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const artistaData = docSnap.data();
            document.title = `Galeria - ${artistaData.nome}`;
            document.getElementById('artista-logo').src = artistaData.imageUrl;
            document.getElementById('artista-nome').textContent = artistaData.nome;
            const instagramLinkElement = document.getElementById('artista-instagram-link');
            instagramLinkElement.href = artistaData.instagramLink || '#';
            instagramLinkElement.textContent = artistaData.instagramHandle || 'Não informado';
            galeriaContainer.innerHTML = '';
            if (artistaData.imagens && artistaData.imagens.length > 0) {
                artistaData.imagens.forEach(urlImagem => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'gallery-item';
                    const imgElement = document.createElement('img');
                    imgElement.src = urlImagem;
                    imgElement.className = 'gallery-image';
                    imgElement.loading = 'lazy';
                    imgElement.addEventListener('click', () => criarLightbox(urlImagem));
                    itemDiv.appendChild(imgElement);
                    galeriaContainer.appendChild(itemDiv);
                });
            } else {
                 galeriaContainer.innerHTML = '<p style="text-align: center; width: 100%;">Este artista ainda não possui imagens na galeria.</p>';
            }
        } else {
            document.querySelector('.creator-header').style.display = 'none';
            galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
        }
    } catch (error) { console.error('Erro ao carregar dados da galeria:', error); galeriaContainer.innerHTML = '<h1>Ocorreu um erro ao carregar o conteúdo.</h1>'; }
}

async function carregarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    const filtrosContainer = document.getElementById('filtros-container');
    if (!gridContainer) return;
    try {
        const artistasCollection = collection(db, 'artistas');
        const q = query(artistasCollection, orderBy("nome"));
        const snapshot = await getDocs(q);
        let todosArtistas = [];
        snapshot.forEach(doc => todosArtistas.push({ id: doc.id, ...doc.data() }));
        const renderizarArtistas = (lista) => {
            gridContainer.innerHTML = '';
            if (lista.length === 0) { gridContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum artista encontrado.</p>'; return; }
            lista.forEach(artista => gridContainer.appendChild(criarCartaoArtista(artista)));
        };
        filtrosContainer.addEventListener('click', (event) => {
            if (event.target.tagName !== 'BUTTON') return;
            filtrosContainer.querySelector('.active').classList.remove('active');
            event.target.classList.add('active');
            const categoria = event.target.dataset.categoria;
            if (categoria === 'todos') {
                renderizarArtistas(todosArtistas);
            } else {
                const filtrados = todosArtistas.filter(artista => artista.categoria && artista.categoria.includes(categoria));
                renderizarArtistas(filtrados);
            }
        });
        renderizarArtistas(todosArtistas);
    } catch (error) { console.error("Erro ao montar a página de artistas:", error); gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar.</p>'; }
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
    } catch (error) { console.error('Erro ao carregar a página:', error); contentDiv.innerHTML = '<h1>Erro ao carregar a página.</h1>'; }
};


// --- 6. PONTO DE ENTRADA (INICIALIZAÇÃO DO SITE PÚBLICO) ---
function initializeRouter() {
    window.addEventListener('hashchange', loadContent);
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    }
    loadContent();
}

if (document.getElementById('app-content')) {
    document.addEventListener('DOMContentLoaded', initializeRouter);
}