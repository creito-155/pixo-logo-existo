// ===================================================================
// script.js - VERSÃO SIMPLES E CORRIGIDA
// Data: 03 de Outubro de 2025
// ===================================================================


// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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


// --- 2. FUNÇÕES GERAIS (USADAS EM VÁRIAS PÁGINAS) ---

function criarCartaoArtista(artista) {
    const link = document.createElement('a');
    link.href = `/galeria.html?id=${artista.id}`; 
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


// --- 3. FUNÇÕES ESPECÍFICAS DE CADA PÁGINA ---

async function carregarPaginaHome() {
    const recomendadosGrid = document.getElementById('recomendados-grid');
    const swiperWrapper = document.querySelector('.artistas-slider .swiper-wrapper');
    if (!recomendadosGrid || !swiperWrapper) return;

    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        
        let todosArtistas = [];
        snapshot.forEach(doc => {
            todosArtistas.push({ id: doc.id, ...doc.data() });
        });
        
        // Lógica para Recomendados
        const sorteados = [...todosArtistas].sort(() => 0.5 - Math.random());
        const selecionados = sorteados.slice(0, 4);
        recomendadosGrid.innerHTML = '';
        selecionados.forEach(artista => recomendadosGrid.appendChild(criarCartaoArtista(artista)));

        // LÓGICA DO CARROSSEL (A PARTE CORRIGIDA)
        swiperWrapper.innerHTML = '';
        todosArtistas.forEach(artista => {
            
            // Pega as 3 primeiras imagens da galeria do artista.
            // Se não tiver 3, ele repete a primeira para preencher o espaço.
            const img1 = artista.imagens[0] || artista.imageUrl; // Usa a 1ª da galeria ou a de perfil
            const img2 = artista.imagens[1] || img1;             // Usa a 2ª ou repete a 1ª
            const img3 = artista.imagens[2] || img2;             // Usa a 3ª ou repete a 2ª

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            // Agora criamos o HTML com as TRÊS imagens, como no seu design original
            slide.innerHTML = `
                <div class="container-bloco">
                    <div class="bloco-imagens">
                        <a href="/galeria.html?id=${artista.id}">
                            <img src="${img1}" alt="Arte de ${artista.nome}">
                            <img src="${img2}" alt="Arte de ${artista.nome}">
                            <img src="${img3}" alt="Arte de ${artista.nome}">
                        </a>
                    </div>
                    <p class="legenda-galeria">Galeria ${artista.nome}</p>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });
        
        // Inicializa o Swiper depois que tudo foi criado
        new Swiper('.artistas-slider', {
            loop: todosArtistas.length > 3,
            breakpoints: { 320: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });

    } catch (error) {
        console.error("Erro ao carregar a página inicial:", error);
    }
}

async function carregarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    if (!gridContainer) return;

    try {
        const artistasCollection = collection(db, 'artistas');
        const q = query(artistasCollection, orderBy("nome"));
        const snapshot = await getDocs(q);
        
        let todosArtistas = [];
        snapshot.forEach(doc => {
            todosArtistas.push({ id: doc.id, ...doc.data() });
        });
        
        gridContainer.innerHTML = '';
        todosArtistas.forEach(artista => gridContainer.appendChild(criarCartaoArtista(artista)));
        
    } catch (error) {
        console.error("Erro ao carregar página de artistas:", error);
    }
}

async function carregarGaleriaIndividual() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const artistaId = params.get('id');

        if (!artistaId) throw new Error("ID do artista não encontrado na URL.");
        
        const docRef = doc(db, 'artistas', artistaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const artistaData = docSnap.data();
            document.title = `Galeria - ${artistaData.nome}`;
            document.getElementById('artista-logo').src = artistaData.imageUrl;
            document.getElementById('artista-nome').textContent = artistaData.nome;

            const instagramLinkElement = document.getElementById('artista-instagram-link');
            if(instagramLinkElement) {
                instagramLinkElement.href = artistaData.instagramLink || '#';
                instagramLinkElement.textContent = artistaData.instagramHandle || 'Não informado';
            }
            
            galeriaContainer.innerHTML = '';
            if (artistaData.imagens && artistaData.imagens.length > 0) {
                artistaData.imagens.forEach(urlImagem => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'gallery-item';
                    const imgElement = document.createElement('img');
                    imgElement.src = urlImagem;
                    imgElement.className = 'gallery-image';
                    imgElement.loading = 'lazy';
                    // A função criarLightbox não está definida, então comentei por enquanto.
                    // imgElement.addEventListener('click', () => criarLightbox(urlImagem)); 
                    itemDiv.appendChild(imgElement);
                    galeriaContainer.appendChild(itemDiv);
                });
            } else {
                 galeriaContainer.innerHTML = '<p style="text-align: center; width: 100%;">Este artista ainda não possui imagens na galeria.</p>';
            }

        } else {
            galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
        }
    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
    }
}

// --- 4. O GERENTE (Roda o código certo na página certa) ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('recomendados-grid')) {
        carregarPaginaHome();
    }
    if (document.getElementById('todos-os-artistas-grid')) {
        carregarPaginaDeArtistas();
    }
    if (document.getElementById('galeria-container')) {
        carregarGaleriaIndividual();
    }
});