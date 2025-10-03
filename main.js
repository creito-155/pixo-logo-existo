// ===================================================================
// main.js - ARQUIVO ÚNICO COM TODA A LÓGICA DO SITE
// Data: 01 de Outubro de 2025
// ===================================================================


// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
// Importa as funções que precisamos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAupMjhUrCyp6PoL94SF1OuNIw5YAvGGkA",
  authDomain: "pixologoexisto-db.firebaseapp.com",
  projectId: "pixologoexisto-db",
  storageBucket: "pixologoexisto-db.firebasestorage.app",
  messagingSenderId: "467304417056",
  appId: "1:467304417056:web:4bc011dcbbc30bcfa87945",
  measurementId: "G-VNSTTLFYHQ"
};

// Inicializa o Firebase e obtém a referência do banco de dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- 2. FUNÇÕES DE UI (INTERFACE DO USUÁRIO) ---

/**
 * Cria e exibe uma lightbox (popup de imagem) na tela.
 * @param {string} imageUrl - A URL da imagem a ser exibida.
 */
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
    
    const closeLightbox = () => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    };
    
    overlay.addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', onEsc);
        }
    });
}

/**
 * Inicializa o carrossel da Swiper.js na página inicial.
 */
function inicializarCarrosselHome() {
    const sliderElement = document.querySelector('.artistas-slider');
    if (sliderElement && typeof Swiper !== 'undefined') {
        new Swiper(sliderElement, {
            loop: true,
            speed: 1500,
            breakpoints: {
                320: { slidesPerView: 1, slidesPerGroup: 1 },
                768: { slidesPerView: 3, slidesPerGroup: 3 },
                1024: { slidesPerView: 4, slidesPerGroup: 4 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }
}


// --- 3. FUNÇÕES DE DADOS (LÓGICA DO FIREBASE) ---

/**
 * Cria o elemento HTML (cartão) para um artista.
 * @param {object} artista - O objeto do artista com id, nome, imageUrl.
 * @returns {HTMLElement} O elemento <a> do cartão do artista.
 */
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

/**
 * Busca artistas no Firebase, sorteia 4 e os exibe na seção de recomendados.
 */
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
    } catch (error) {
        console.error("Erro ao buscar artistas recomendados:", error);
        recomendadosGrid.innerHTML = '<p>Erro ao carregar artistas.</p>';
    }
}

/**
 * Carrega a página de galeria de um artista específico com base no ID da URL.
 */
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
            // Presume que o documento do artista tem um campo 'imagens' que é um array de URLs
            if (artistaData.imagens && Array.isArray(artistaData.imagens) && artistaData.imagens.length > 0) {
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
    } catch (error) {
        console.error('Erro ao carregar dados da galeria:', error);
        galeriaContainer.innerHTML = '<h1>Ocorreu um erro ao carregar o conteúdo.</h1>';
    }
}

/**
 * Carrega a lista completa de artistas na página 'Artistas', com filtros.
 */
async function carregarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    const filtrosContainer = document.getElementById('filtros-container');
    if (!gridContainer) return;

    try {
        const artistasCollection = collection(db, 'artistas');
        const q = query(artistasCollection, orderBy("nome")); // Ordena por nome
        const snapshot = await getDocs(q);
        
        let todosArtistas = [];
        snapshot.forEach(doc => todosArtistas.push({ id: doc.id, ...doc.data() }));

        const renderizarArtistas = (lista) => {
            gridContainer.innerHTML = '';
            if (lista.length === 0) {
                gridContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum artista encontrado nesta categoria.</p>';
                return;
            }
            lista.forEach(artista => gridContainer.appendChild(criarCartaoArtista(artista)));
        };

        // Lógica de filtro
        filtrosContainer.addEventListener('click', (event) => {
            if (event.target.tagName !== 'BUTTON') return;
            
            filtrosContainer.querySelector('.active').classList.remove('active');
            event.target.classList.add('active');

            const categoria = event.target.dataset.categoria;
            if (categoria === 'todos') {
                renderizarArtistas(todosArtistas);
            } else {
                const filtrados = todosArtistas.filter(artista => 
                    artista.categoria && artista.categoria.includes(categoria)
                );
                renderizarArtistas(filtrados);
            }
        });
        
        // Renderização inicial
        renderizarArtistas(todosArtistas);

    } catch (error) {
        console.error("Erro ao montar a página de artistas:", error);
        gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar os artistas.</p>';
    }
}


// --- 4. ROTEADOR (LÓGICA DA SPA) ---
const routes = {
    '/home': '/pages/home.html',
    '/artistas': '/pages/artistas.html',
    '/quem-somos': '/pages/quem-somos.html',
    '/onde-atuamos': '/pages/onde-atuamos.html',
    '/galeria': '/pages/galeria.html'
};

const loadContent = async () => {
    const contentDiv = document.getElementById('app-content');
    const path = window.location.hash.substring(1) || '/home';
    
    let routeFile;
    if (path.startsWith('/galeria/')) {
        routeFile = routes['/galeria'];
    } else {
        routeFile = routes[path] || '/pages/404.html'; // Crie um /pages/404.html para erros
    }

    try {
        const response = await fetch(routeFile);
        const html = await response.text();
        contentDiv.innerHTML = html;

        // Chama as funções corretas após o conteúdo da página ser carregado
        if (path.startsWith('/galeria/')) {
            carregarGaleriaIndividual();
        } else if (path === '/home') {
            inicializarCarrosselHome();
            carregarArtistasRecomendados();
        } else if (path === '/artistas') {
            carregarPaginaDeArtistas();
        }
        // As páginas estáticas como /quem-somos não precisam de chamada de função.

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        contentDiv.innerHTML = '<h1>Erro ao carregar a página.</h1>';
    }
};


// --- 5. PONTO DE ENTRADA (INICIALIZAÇÃO DO SITE) ---
function initializeRouter() {
    window.addEventListener('hashchange', loadContent);
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    }
    loadContent();
}

// Inicia o roteador assim que a página principal (DOM) for carregada
document.addEventListener('DOMContentLoaded', initializeRouter);