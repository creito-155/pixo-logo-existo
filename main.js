// ===================================================================
// main.js - VERSÃO FINAL UNIFICADA (SPA)
// ===================================================================

// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query, addDoc, setDoc, where, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

let currentArtistId = null;

// --- 2. FUNÇÕES DE UTILIDADE, SEGURANÇA E VALIDAÇÃO ---
function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

function validarNome(nome) {
    return typeof nome === "string" && nome.trim().length >= 2 && /^[a-zA-ZÀ-ÿ0-9\s]+$/.test(nome.trim());
}

function validarInstagram(instagram) {
    return typeof instagram === "string" && instagram.trim().length > 0 && /^@?[a-zA-Z0-9._]+$/.test(instagram.trim());
}

// Função aprimorada para formatar categorias, capitalizando cada palavra.
function formatarCategorias(categoriasInput) {
    if (typeof categoriasInput !== 'string') return '';
    return categoriasInput
        .split(',')
        .map(cat => {
            return cat.trim().split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        })
        .filter(cat => cat)
        .join(', ');
}


// --- 3. LÓGICA DE AUTENTICAÇÃO E UI GLOBAL ---

// Monitora o estado de autenticação para proteger rotas e atualizar a UI
onAuthStateChanged(auth, (user) => {
    atualizarBarraSuperior(user);
    const path = window.location.hash.substring(1);
    const isProtectedRoute = path === '/admin' || path.startsWith('/edit-profile');
    if (!user && isProtectedRoute) {
        window.location.hash = '#/login'; // Redireciona se não estiver logado
    }
});

// Atualiza a área de perfil no cabeçalho
async function atualizarBarraSuperior(user) {
    const userProfileArea = document.getElementById('user-profile-area');
    if (!userProfileArea) return;

    if (user) {
        try {
            const q = query(collection(db, "artistas"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const artistaData = querySnapshot.docs[0].data();
                userProfileArea.innerHTML = `<a href="#/admin" title="Painel de Controle"><img src="${escapeHTML(artistaData.imageUrl)}" class="profile-pic-header" alt="Foto de perfil"></a>`;
            } else {
                userProfileArea.innerHTML = `<a href="#/admin" class="login-button">Criar Perfil</a>`;
            }
        } catch (error) {
            console.error("Erro ao buscar dados do artista para o cabeçalho:", error);
            userProfileArea.innerHTML = `<a href="#/admin" class="login-button">Painel</a>`;
        }
    } else {
        userProfileArea.innerHTML = `<a href="#/login" class="login-button">Login / Cadastrar</a>`;
    }
}

// --- 4. FUNÇÕES DE LÓGICA POR PÁGINA ---

// HOME
async function inicializarHome() {
    await carregarArtistasNoCarrossel();
    await carregarArtistasRecomendados();
}

// PÁGINA DE ARTISTAS
async function inicializarArtistas() {
    await carregarPaginaDeArtistas();
}

// GALERIA INDIVIDUAL
async function inicializarGaleria() {
    await carregarGaleriaIndividual();
}

// LOGIN
function inicializarLogin() {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = formLogin.email.value;
            const senha = formLogin.senha.value;
            const erroLogin = document.getElementById('login-error');
            signInWithEmailAndPassword(auth, email, senha)
                .then(() => window.location.hash = '#/admin')
                .catch(() => erroLogin.textContent = "Email ou senha inválidos. Verifique se você já confirmou seu e-mail.");
        });
    }
}

// CADASTRO
function inicializarCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nomeArtista = document.getElementById('artista-nome-cadastro').value;
            const email = document.getElementById('email-cadastro').value;
            const senha = document.getElementById('senha-cadastro').value;
            const statusDiv = document.getElementById('cadastro-status');
            statusDiv.textContent = "Criando conta...";
            statusDiv.style.color = "orange";

            if (!validarNome(nomeArtista)) {
                statusDiv.textContent = "Nome inválido.";
                statusDiv.style.color = "red";
                return;
            }

            createUserWithEmailAndPassword(auth, email, senha)
                .then((userCredential) => {
                    const user = userCredential.user;
                    sendEmailVerification(user).then(() => {
                        statusDiv.textContent = 'Sucesso! Link de verificação enviado para seu e-mail. Confirme antes de fazer login.';
                        statusDiv.style.color = 'green';
                        formCadastro.reset();
                    });
                    const userDocRef = doc(db, "usuarios", user.uid);
                    setDoc(userDocRef, { nomeArtista: escapeHTML(nomeArtista), email: user.email, criadoEm: new Date() });
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') { statusDiv.textContent = "Erro: Este e-mail já está em uso."; }
                    else if (error.code === 'auth/weak-password') { statusDiv.textContent = "Erro: A senha precisa ter no mínimo 6 caracteres."; }
                    else { statusDiv.textContent = "Ocorreu um erro ao criar a conta."; }
                    statusDiv.style.color = "red";
                });
        });
    }
}

// PAINEL DE ADMIN
async function inicializarAdmin() {
    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            signOut(auth).then(() => window.location.hash = '#/login');
        });
    }

    // Lógica para mostrar "criar" ou "editar" perfil
    const user = auth.currentUser;
    if (!user) return;

    const createSection = document.getElementById('create-profile-section');
    const editSection = document.getElementById('edit-profile-section');
    const loadingAdmin = document.getElementById('loading-admin');

    try {
        const q = query(collection(db, "artistas"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (loadingAdmin) loadingAdmin.style.display = 'none';

        if (querySnapshot.empty) {
            if (createSection) createSection.style.display = 'block';
            if (editSection) editSection.style.display = 'none';
            // Adicionar listener ao formulário de criação
            vincularFormularioCriarArtista();
        } else {
            const artistaDoc = querySnapshot.docs[0];
            const artistaData = artistaDoc.data();
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Bem-vindo de volta, ${escapeHTML(artistaData.nome)}!`;
            }
            const editProfileLink = document.getElementById('edit-profile-link');
            if (editProfileLink) {
                editProfileLink.href = `#/edit-profile/${artistaDoc.id}`; // Rota SPA
            }
            if (createSection) createSection.style.display = 'none';
            if (editSection) editSection.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro CRÍTICO ao verificar perfil do artista:", error);
        if (loadingAdmin) {
            loadingAdmin.textContent = "Ocorreu um erro ao verificar seu perfil.";
            loadingAdmin.style.color = "red";
        }
    }
}

// EDIÇÃO DE PERFIL
async function inicializarEditProfile() {
    const pathParts = window.location.hash.split('/');
    currentArtistId = pathParts[2]; // Pega o ID da URL

    if (!currentArtistId) {
        document.getElementById('app-content').innerHTML = '<h1>ID do artista não fornecido.</h1>';
        return;
    }

    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            signOut(auth).then(() => window.location.hash = '#/login');
        });
    }

    await carregarDadosParaEdicao();
    vincularFormularioEditarArtista();
    vincularGerenciadorDeGaleria();
}

// --- 5. FUNÇÕES DE MANIPULAÇÃO DE DADOS E FORMULÁRIOS ---

function vincularFormularioCriarArtista() {
    const formAddArtista = document.getElementById('form-add-artista');
    if (formAddArtista) {
        formAddArtista.addEventListener('submit', async (e) => {
            e.preventDefault();
            const botaoSalvar = document.getElementById('botao-salvar-artista');
            const uploadStatus = document.getElementById('upload-status');
            const user = auth.currentUser;
            if (!user) { uploadStatus.textContent = "Erro: Sessão expirada."; return; }

            const nomeArtista = document.getElementById('artista-nome').value.trim();
            const imagemArquivo = document.getElementById('artista-imagem').files[0];
            const instagramHandle = document.getElementById('artista-instagram').value.trim();
            const categoriasInput = document.getElementById('artista-categorias').value;

            if (!nomeArtista || !imagemArquivo) {
                uploadStatus.textContent = 'Nome e Imagem são obrigatórios.'; return;
            }

            botaoSalvar.disabled = true;
            uploadStatus.textContent = 'Verificando artista...';

            try {
                // Formata categorias para um array
                const categoriasFormatadas = formatarCategorias(categoriasInput);
                const categoriasArray = categoriasFormatadas.split(',').map(item => item.trim()).filter(item => item);
                if (categoriasArray.length === 0) {
                    uploadStatus.textContent = 'Adicione pelo menos uma categoria.';
                    botaoSalvar.disabled = false;
                    return;
                }

                uploadStatus.textContent = 'Enviando imagem...';
                const formData = new FormData();
                formData.append('file', imagemArquivo);
                formData.append('upload_preset', 'artistas_uploads');
                const CLOUD_NAME = 'dj053fl2q';
                const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
                const response = await fetch(uploadUrl, { method: 'POST', body: formData });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error.message || 'Falha no upload.');
                const imageUrl = data.secure_url;

                uploadStatus.textContent = 'Salvando no banco de dados...';
                await addDoc(collection(db, 'artistas'), {
                    userId: user.uid,
                    nome: escapeHTML(nomeArtista),
                    imageUrl: escapeHTML(imageUrl),
                    instagramHandle: escapeHTML(instagramHandle),
                    instagramLink: `https://www.instagram.com/${escapeHTML(instagramHandle.replace('@', ''))}`,
                    categoria: categoriasArray,
                    imagens: []
                });

                uploadStatus.textContent = 'Perfil criado com sucesso!';
                uploadStatus.style.color = 'green';
                formAddArtista.reset();
                inicializarAdmin(); // Recarrega a lógica da página de admin

            } catch (error) {
                console.error("Erro ao criar artista: ", error);
                uploadStatus.textContent = `Erro: ${error.message}`;
                uploadStatus.style.color = 'red';
            } finally {
                botaoSalvar.disabled = false;
            }
        });
    }
}

async function carregarDadosParaEdicao() {
    const appContent = document.getElementById('app-content');
    try {
        const docRef = doc(db, 'artistas', currentArtistId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const artistaData = docSnap.data();
            document.getElementById('artista-nome').value = artistaData.nome || '';
            document.getElementById('artista-instagram').value = artistaData.instagramHandle || '';
            if (artistaData.categoria && Array.isArray(artistaData.categoria)) {
                artistaData.categoria.forEach(cat => {
                    const checkbox = document.querySelector(`#categorias-opcoes input[value="${cat}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            renderizarGerenciadorDeGaleria(artistaData.imagens);
        } else {
            appContent.innerHTML = '<h1>Artista não encontrado.</h1>';
        }
    } catch (error) {
        console.error("Erro ao carregar dados do artista para edição:", error);
        appContent.innerHTML = '<h1>Erro ao carregar dados.</h1>';
    }
}

function vincularFormularioEditarArtista() {
    const formEditArtista = document.getElementById('form-edit-artista');
    if (formEditArtista) {
        formEditArtista.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentArtistId) return;
            const botaoAtualizar = document.getElementById('botao-atualizar-artista');
            const updateStatus = document.getElementById('update-status');
            botaoAtualizar.disabled = true;
            updateStatus.textContent = 'Atualizando perfil...';
            updateStatus.style.color = 'orange';

            try {
                const nome = document.getElementById('artista-nome').value;
                const imagemArquivo = document.getElementById('artista-imagem').files[0];
                const instagramHandle = document.getElementById('artista-instagram').value;
                const categoriasSelecionadas = Array.from(document.querySelectorAll('#categorias-opcoes input[name="categoria"]:checked')).map(input => input.value);

                if (!validarNome(nome)) { updateStatus.textContent = 'Nome inválido.'; return; }
                if (!validarInstagram(instagramHandle)) { updateStatus.textContent = 'Instagram inválido.'; return; }
                if (categoriasSelecionadas.length === 0) { updateStatus.textContent = 'Selecione pelo menos uma categoria.'; return; }

                const dadosParaAtualizar = {
                    nome: escapeHTML(nome),
                    instagramHandle: escapeHTML(instagramHandle),
                    instagramLink: `https://www.instagram.com/${escapeHTML(instagramHandle.replace('@', ''))}`,
                    categoria: categoriasSelecionadas,
                };

                if (imagemArquivo) {
                    updateStatus.textContent = 'Enviando nova imagem...';
                    const formData = new FormData();
                    formData.append('file', imagemArquivo);
                    formData.append('upload_preset', 'artistas_uploads');
                    const CLOUD_NAME = 'dj053fl2q';
                    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
                    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error.message || 'Falha no upload da nova imagem.');
                    dadosParaAtualizar.imageUrl = escapeHTML(data.secure_url);
                }

                updateStatus.textContent = 'Salvando no banco de dados...';
                const docRef = doc(db, 'artistas', currentArtistId);
                await updateDoc(docRef, dadosParaAtualizar);
                updateStatus.textContent = 'Perfil atualizado com sucesso!';
                updateStatus.style.color = 'green';
                await atualizarBarraSuperior(auth.currentUser); // Atualiza foto do header se mudou

            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                updateStatus.textContent = `Erro: ${error.message}`;
                updateStatus.style.color = 'red';
            } finally {
                botaoAtualizar.disabled = false;
            }
        });
    }
}

// --- 6. GERENCIADOR DE GALERIA (PÁGINA DE EDIÇÃO) ---
function renderizarGerenciadorDeGaleria(imagens = []) {
    const grid = document.getElementById('gallery-grid-admin');
    if (!grid) return;
    grid.innerHTML = '';
    imagens.forEach(url => {
        const card = document.createElement('div');
        card.className = 'gallery-thumb-container';
        card.innerHTML = `<img src="${escapeHTML(url)}" alt="Imagem da galeria"><button class="delete-image-btn" data-url="${escapeHTML(url)}">-</button>`;
        grid.appendChild(card);
    });
    const addCard = document.createElement('div');
    addCard.className = 'add-image-card';
    addCard.title = 'Adicionar novas imagens';
    addCard.onclick = () => { document.getElementById('gallery-file-input').click(); };
    grid.appendChild(addCard);
}

function vincularGerenciadorDeGaleria() {
    const galleryFileInput = document.getElementById('gallery-file-input');
    if (galleryFileInput) {
        galleryFileInput.addEventListener('change', async (e) => {
            if (!currentArtistId) return;
            const files = e.target.files;
            const statusDiv = document.getElementById('gallery-upload-status');
            if (files.length === 0) return;
            statusDiv.textContent = `Enviando ${files.length} imagem(ns)...`;
            statusDiv.style.color = 'orange';

            const CLOUD_NAME = 'dj053fl2q';
            const UPLOAD_PRESET = 'artistas_uploads';
            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
            const uploadPromises = Array.from(files).map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                return fetch(uploadUrl, { method: 'POST', body: formData }).then(res => res.json());
            });

            try {
                const uploadResults = await Promise.all(uploadPromises);
                const novasUrls = uploadResults.map(r => r.secure_url).filter(url => url);
                if (novasUrls.length > 0) {
                    const docRef = doc(db, 'artistas', currentArtistId);
                    await updateDoc(docRef, { imagens: arrayUnion(...novasUrls) });
                    const updatedDocSnap = await getDoc(docRef);
                    renderizarGerenciadorDeGaleria(updatedDocSnap.data().imagens);
                }
                statusDiv.textContent = `${novasUrls.length} imagem(ns) adicionada(s) com sucesso!`;
                statusDiv.style.color = 'green';
            } catch (error) {
                statusDiv.textContent = 'Erro no upload. Tente novamente.';
                statusDiv.style.color = 'red';
                console.error(error);
            }
        });
    }

    const galleryGridAdmin = document.getElementById('gallery-grid-admin');
    if (galleryGridAdmin) {
        galleryGridAdmin.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-image-btn')) {
                if (!currentArtistId || !confirm('Tem certeza que deseja apagar esta imagem?')) return;
                const urlParaApagar = e.target.dataset.url;
                const statusDiv = document.getElementById('gallery-upload-status');
                statusDiv.textContent = 'Apagando imagem...';

                try {
                    const docRef = doc(db, 'artistas', currentArtistId);
                    await updateDoc(docRef, { imagens: arrayRemove(urlParaApagar) });
                    const updatedDocSnap = await getDoc(docRef);
                    renderizarGerenciadorDeGaleria(updatedDocSnap.data().imagens);
                    statusDiv.textContent = 'Imagem apagada com sucesso.';
                    statusDiv.style.color = 'green';
                } catch (error) {
                    statusDiv.textContent = 'Erro ao apagar a imagem.';
                    statusDiv.style.color = 'red';
                    console.error(error);
                }
            }
        });
    }
}


// --- 7. FUNÇÕES DE UI E DADOS (SITE PÚBLICO) ---
function criarLightbox(imageUrl) {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = `<span id="lightbox-close">&times;</span><img id="lightbox-image" src="${escapeHTML(imageUrl)}">`;
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

function criarCartaoArtista(artista) {
    const link = document.createElement('a');
    link.href = `#/galeria/${escapeHTML(artista.id)}`; // Rota SPA
    link.className = 'gallery-item';
    link.innerHTML = `
        <img src="${escapeHTML(artista.imageUrl)}" alt="Foto do artista ${escapeHTML(artista.nome)}" class="gallery-image" loading="lazy">
        <p class="artist-card-name">${escapeHTML(artista.nome)}</p>
    `;
    return link;
}

async function carregarArtistasNoCarrossel() {
    const swiperWrapper = document.querySelector('.artistas-slider .swiper-wrapper');
    if (!swiperWrapper) return;
    try {
        const snapshot = await getDocs(collection(db, 'artistas'));
        const todosArtistas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        swiperWrapper.innerHTML = ''; // Limpa antes de adicionar
        todosArtistas.forEach(artista => {
            const img1 = (artista.imagens && artista.imagens[0]) || artista.imageUrl;
            const img2 = (artista.imagens && artista.imagens[1]) || img1;
            const img3 = (artista.imagens && artista.imagens[2]) || img2;
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<div class="container-bloco"><div class="bloco-imagens"><a href="#/galeria/${escapeHTML(artista.id)}"><img src="${escapeHTML(img1)}" alt="Arte de ${escapeHTML(artista.nome)}"><img src="${escapeHTML(img2)}" alt="Arte de ${escapeHTML(artista.nome)}"><img src="${escapeHTML(img3)}" alt="Arte de ${escapeHTML(artista.nome)}"></a></div><p class="legenda-galeria">Galeria ${escapeHTML(artista.nome)}</p></div>`;
            swiperWrapper.appendChild(slide);
        });

        // Inicializa o Swiper (é preciso que a biblioteca Swiper.js esteja importada no seu HTML)
        if (window.Swiper) {
            new Swiper('.artistas-slider', {
                loop: todosArtistas.length > 3,
                speed: 1500,
                breakpoints: { 320: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            });
        }
    } catch (error) { console.error("Erro ao carregar artistas no carrossel:", error); }
}

async function carregarArtistasRecomendados() {
    const recomendadosGrid = document.getElementById('recomendados-grid');
    if (!recomendadosGrid) return;
    recomendadosGrid.innerHTML = '<p>Carregando...</p>';
    try {
        const snapshot = await getDocs(collection(db, 'artistas'));
        let todosArtistas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        todosArtistas.sort(() => 0.5 - Math.random()); // Embaralha
        const selecionados = todosArtistas.slice(0, 4);

        recomendadosGrid.innerHTML = '';
        selecionados.forEach(artista => { recomendadosGrid.appendChild(criarCartaoArtista(artista)); });
    } catch (error) {
        console.error("Erro ao buscar artistas recomendados:", error);
        recomendadosGrid.innerHTML = '<p>Erro ao carregar artistas.</p>';
    }
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
            document.title = `Galeria - ${escapeHTML(artistaData.nome)}`;
            document.getElementById('artista-logo').src = escapeHTML(artistaData.imageUrl);
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
                    imgElement.src = escapeHTML(urlImagem);
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
            document.querySelector('.creator-header')?.style.display = 'none';
            galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
        }
    } catch (error) {
        console.error('Erro ao carregar dados da galeria:', error);
        galeriaContainer.innerHTML = '<h1>Ocorreu um erro ao carregar o conteúdo.</h1>';
    }
}

async function carregarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    const filtrosContainer = document.getElementById('filtros-container');
    if (!gridContainer) return;
    try {
        const q = query(collection(db, 'artistas'), orderBy("nome"));
        const snapshot = await getDocs(q);
        const todosArtistas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const renderizarArtistas = (lista) => {
            gridContainer.innerHTML = '';
            if (lista.length === 0) {
                gridContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum artista encontrado.</p>';
                return;
            }
            lista.forEach(artista => { gridContainer.appendChild(criarCartaoArtista(artista)); });
        };

        if (filtrosContainer) {
            filtrosContainer.addEventListener('click', (event) => {
                if (event.target.tagName !== 'BUTTON') return;
                filtrosContainer.querySelector('.active')?.classList.remove('active');
                event.target.classList.add('active');
                const categoria = event.target.dataset.categoria;
                if (categoria === 'todos') {
                    renderizarArtistas(todosArtistas);
                } else {
                    const filtrados = todosArtistas.filter(artista => artista.categoria && artista.categoria.includes(categoria));
                    renderizarArtistas(filtrados);
                }
            });
        }
        renderizarArtistas(todosArtistas);
    } catch (error) {
        console.error("Erro ao montar a página de artistas:", error);
        gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar.</p>';
    }
}


// --- 8. ROTEADOR (LÓGICA DA SPA) ---
const routes = {
    '/home': '/pages/home.html',
    '/artistas': '/pages/artistas.html',
    '/quem-somos': '/pages/quem-somos.html',
    '/onde-atuamos': '/pages/onde-atuamos.html',
    '/galeria': '/pages/galeria.html',
    '/login': '/pages/login.html',
    '/cadastro': '/pages/cadastro.html',
    '/admin': '/pages/admin.html',
    '/edit-profile': '/pages/edit-profile.html'
};

const loadContent = async () => {
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    
    // Pega o caminho base da rota (ex: /galeria de /galeria/id123)
    const path = window.location.hash.substring(1) || '/home';
    const basePath = '/' + path.split('/')[1];
    const routeFile = routes[basePath] || '/pages/404.html';

    try {
        const response = await fetch(routeFile);
        if (!response.ok) throw new Error('Página não encontrada');
        
        contentDiv.innerHTML = await response.text();
        await initializePageScripts(path);
    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        contentDiv.innerHTML = '<h1>Erro 404: Página não encontrada.</h1>';
    }
};

const initializePageScripts = async (fullPath) => {
    const basePath = '/' + fullPath.split('/')[1];

    switch (basePath) {
        case '/home':
            await inicializarHome();
            break;
        case '/artistas':
            await inicializarArtistas();
            break;
        case '/galeria':
            await inicializarGaleria();
            break;
        case '/login':
            inicializarLogin();
            break;
        case '/cadastro':
            inicializarCadastro();
            break;
        case '/admin':
            await inicializarAdmin();
            break;
        case '/edit-profile':
            await inicializarEditProfile();
            break;
    }
};

// --- 9. PONTO DE ENTRADA E INICIALIZAÇÃO GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
    // Roteador
    window.addEventListener('hashchange', loadContent);
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    }
    loadContent(); // Carrega o conteúdo inicial

    // Menu Hambúrguer
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    if (hamburgerButton && mainNav) {
        hamburgerButton.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });
    }
});