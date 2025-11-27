// ===================================================================
// main.js - VERSÃO PRIORIDADE MÁXIMA (SVL, STR, GSR FIXOS NO TOPO)
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
let heroInterval = null; 

// --- FUNÇÕES DE SEGURANÇA E VALIDAÇÃO ---
function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"']/g, function(m) {
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

// --- 2. LÓGICA DE AUTENTICAÇÃO E PAINEL DE ADMIN ---
async function setupAdminPage() {
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
        } else {
            const artistaDoc = querySnapshot.docs[0];
            const artistaData = artistaDoc.data();
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Bem-vindo de volta, ${escapeHTML(artistaData.nome)}!`;
            }
            
            const editProfileLink = document.getElementById('edit-profile-link');
            if (editProfileLink) editProfileLink.href = `#/edit-profile/${artistaDoc.id}`;

            const manageGalleryLink = document.getElementById('manage-gallery-link');
            if (manageGalleryLink) manageGalleryLink.href = `#/gerenciar-galeria/${artistaDoc.id}`;

            if (createSection) createSection.style.display = 'none';
            if (editSection) editSection.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro CRÍTICO ao verificar perfil do artista:", error);
    }
}

function ativarBotoesAdmin() {
    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.hash = '#/login';
            });
        });
    }
}

onAuthStateChanged(auth, async (user) => {
    const userProfileArea = document.getElementById('user-profile-area');
    if (userProfileArea) {
        if (user) {
            const q = query(collection(db, "artistas"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const artistaData = querySnapshot.docs[0].data();
                userProfileArea.innerHTML = `<a href="#/admin" title="Painel de Controle"><img src="${escapeHTML(artistaData.imageUrl)}" class="profile-pic-header" alt="Foto de perfil"></a>`;
            } else {
                userProfileArea.innerHTML = `<a href="#/admin" class="login-button">Criar Perfil</a>`;
            }
        } else {
            userProfileArea.innerHTML = `<a href="#/login" class="login-button">Login / Cadastrar</a>`;
        }
    }
    
    const currentHash = window.location.hash;
    const onAdminPage = currentHash === '#/admin' || currentHash.startsWith('#/edit-profile') || currentHash.startsWith('#/gerenciar-galeria');
    if (!user && onAdminPage) {
        window.location.hash = '#/login';
    }
});


// --- 3. FUNÇÕES PARA ATIVAR FORMULÁRIOS ---

function ativarFormularioCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();

            const nomeArtista = document.getElementById('artista-nome-cadastro').value.trim().toUpperCase();
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
                .then(async (userCredential) => { 
                    const user = userCredential.user;
                    try {
                        statusDiv.textContent = "Salvando perfil no banco de dados...";
                        const userDocRef = doc(db, "usuarios", user.uid);
                        await setDoc(userDocRef, { 
                            nomeArtista: escapeHTML(nomeArtista), 
                            email: user.email, 
                            criadoEm: new Date() 
                        });
                        statusDiv.textContent = "Enviando e-mail de verificação...";
                        await sendEmailVerification(user);
                        statusDiv.textContent = 'Sucesso! Perfil criado. Link de verificação enviado para seu e-mail.';
                        statusDiv.style.color = 'green';
                        formCadastro.reset();
                    } catch (dbError) {
                        console.error("Erro ao salvar perfil ou enviar email:", dbError);
                        statusDiv.textContent = "Conta criada, mas houve um erro ao salvar seu perfil.";
                        statusDiv.style.color = "red";
                    }
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

function ativarFormularioLogin() {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = formLogin.email.value;
            const senha = formLogin.senha.value;
            const erroLogin = document.getElementById('login-error');
            signInWithEmailAndPassword(auth, email, senha)
                .then(() => window.location.hash = '#/admin')
                .catch(() => {
                    if (erroLogin) erroLogin.textContent = "Email ou senha inválidos.";
                });
        });
    }
}

// --- 4. FORMULÁRIO DE CADASTRO DE ARTISTA ---
function ativarFormularioAddArtista() {
    const formAddArtista = document.getElementById('form-add-artista');
    if (formAddArtista) {
        formAddArtista.addEventListener('submit', async (e) => {
            e.preventDefault();

            const botaoSalvar = document.getElementById('botao-salvar-artista');
            const uploadStatus = document.getElementById('upload-status');
            const user = auth.currentUser;
            if (!user) {
                uploadStatus.textContent = "Erro: Sessão expirada.";
                return;
            }

            const nomeArtista = document.getElementById('artista-nome').value.trim().toUpperCase();
            const imagemArquivo = document.getElementById('artista-imagem').files[0];
            const instagramHandle = document.getElementById('artista-instagram').value.trim();
            const checkboxesMarcados = document.querySelectorAll('input[name="categoria"]:checked');
            const categoriasArray = Array.from(checkboxesMarcados).map(checkbox => checkbox.value);

            if (!nomeArtista || !imagemArquivo) {
                uploadStatus.textContent = 'Nome e Imagem são obrigatórios.';
                return;
            }
            if (categoriasArray.length === 0) {
                uploadStatus.textContent = 'Selecione pelo menos uma categoria.';
                return;
            }
            if (!validarNome(nomeArtista) || !validarInstagram(instagramHandle)) {
                 uploadStatus.textContent = 'Dados inválidos.';
                 return;
            }

            botaoSalvar.disabled = true;
            uploadStatus.textContent = 'Processando...';
            uploadStatus.style.color = 'orange';

            try {
                const artistasRef = collection(db, 'artistas');
                const q = query(artistasRef, where("nome", "==", nomeArtista));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    uploadStatus.textContent = 'Artista encontrado! Associando...';
                    const artistaExistente = querySnapshot.docs[0];
                    await updateDoc(doc(db, 'artistas', artistaExistente.id), { userId: user.uid });
                } else {
                    uploadStatus.textContent = 'Upload imagem...';
                    const formData = new FormData();
                    formData.append('file', imagemArquivo);
                    formData.append('upload_preset', 'artistas_uploads');
                    const uploadUrl = `https://api.cloudinary.com/v1_1/dj053fl2q/image/upload`; 

                    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
                    const data = await response.json();
                    if (!response.ok) throw new Error('Falha no upload.');
                    
                    uploadStatus.textContent = 'Criando perfil...';
                    
                    await addDoc(artistasRef, {
                        userId: user.uid,
                        nome: escapeHTML(nomeArtista),
                        imageUrl: escapeHTML(data.secure_url),
                        instagramHandle: escapeHTML(instagramHandle),
                        instagramLink: `https://www.instagram.com/${escapeHTML(instagramHandle.replace('@', ''))}`,
                        categoria: categoriasArray,
                        imagens: [],
                        criadoEm: new Date().toISOString()
                    });
                }

                uploadStatus.textContent = 'Sucesso!';
                uploadStatus.style.color = 'green';
                
                setTimeout(() => {
                    formAddArtista.reset();
                    setupAdminPage();
                }, 2000);

            } catch (error) {
                console.error("Erro:", error);
                uploadStatus.textContent = `Erro: ${error.message}`;
                uploadStatus.style.color = 'red';
            } finally {
                botaoSalvar.disabled = false;
            }
        });
    }
}

// --- 5. FORMULÁRIO DE EDIÇÃO ---
async function carregarDadosParaEdicao() {
    let artistaId = null;
    const hash = window.location.hash;
    if (hash.startsWith('#/edit-profile/')) {
        artistaId = hash.split('/')[2];
    }
    currentArtistId = artistaId;
    if (!currentArtistId) return;

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
        }
    } catch (error) { console.error("Erro edição:", error); }
}

function ativarFormularioEditArtista() {
    const formEditArtista = document.getElementById('form-edit-artista');
    if (formEditArtista) {
        formEditArtista.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentArtistId) return;
            const botaoAtualizar = document.getElementById('botao-atualizar-artista');
            const updateStatus = document.getElementById('update-status');
            botaoAtualizar.disabled = true;
            updateStatus.textContent = 'Atualizando...';

            try {
                const nome = document.getElementById('artista-nome').value.trim().toUpperCase();
                const imagemArquivo = document.getElementById('artista-imagem').files[0];
                const instagramHandle = document.getElementById('artista-instagram').value;
                const categoriasSelecionadas = Array.from(document.querySelectorAll('#categorias-opcoes input[name="categoria"]:checked'))
                    .map(input => input.value);

                if (!validarNome(nome) || !validarInstagram(instagramHandle) || categoriasSelecionadas.length === 0) {
                     updateStatus.textContent = 'Dados inválidos.';
                     botaoAtualizar.disabled = false;
                     return; 
                }

                const dadosParaAtualizar = {
                    nome: escapeHTML(nome),
                    instagramHandle: escapeHTML(instagramHandle),
                    instagramLink: `https://www.instagram.com/${escapeHTML(instagramHandle.replace('@', ''))}`,
                    categoria: categoriasSelecionadas,
                };

                if (imagemArquivo) {
                    const formData = new FormData();
                    formData.append('file', imagemArquivo);
                    formData.append('upload_preset', 'artistas_uploads');
                    const response = await fetch(`https://api.cloudinary.com/v1_1/dj053fl2q/image/upload`, { method: 'POST', body: formData });
                    const data = await response.json();
                    dadosParaAtualizar.imageUrl = escapeHTML(data.secure_url);
                }

                await updateDoc(doc(db, 'artistas', currentArtistId), dadosParaAtualizar);
                updateStatus.textContent = 'Atualizado!';
                updateStatus.style.color = 'green';
            } catch (error) {
                console.error("Erro:", error);
                updateStatus.textContent = 'Erro.';
            } finally {
                botaoAtualizar.disabled = false;
            }
        });
    }
}

// --- 6. GERENCIADOR DE GALERIA ---
async function carregarDadosParaGerenciarGaleria() {
    let artistaId = null;
    const hash = window.location.hash;
    if (hash.startsWith('#/gerenciar-galeria/')) {
        artistaId = hash.split('/')[2];
    }
    currentArtistId = artistaId;
    if (!currentArtistId) return;

    try {
        const docRef = doc(db, 'artistas', currentArtistId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const artistaData = docSnap.data();
            document.getElementById('artista-logo').src = artistaData.imageUrl;
            document.getElementById('artista-nome').textContent = artistaData.nome;
            renderizarGerenciadorDeGaleria(artistaData.imagens);
        }
    } catch (error) { console.error(error); }
}

function renderizarGerenciadorDeGaleria(imagens = []) {
    const grid = document.getElementById('gallery-grid-admin');
    if (!grid) return;
    grid.innerHTML = '';
    
    const addCard = document.createElement('div');
    addCard.className = 'add-image-card';
    addCard.innerHTML = `<input type="file" id="gallery-file-input" multiple accept="image/*" style="display: none;">`;
    addCard.onclick = () => { document.getElementById('gallery-file-input').click(); };
    grid.appendChild(addCard);

    if (imagens) {
        imagens.forEach(url => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item admin-thumb';
            itemDiv.innerHTML = `
                <img src="${escapeHTML(url)}" class="gallery-image">
                <button class="delete-image-btn" data-url="${escapeHTML(url)}">-</button>
            `;
            grid.appendChild(itemDiv);
        });
    }
}

function ativarGerenciadorGaleria() {
    const grid = document.getElementById('gallery-grid-admin');
    if (!grid) return;

    grid.addEventListener('change', async (e) => {
        if (e.target.id === 'gallery-file-input') {
            if (!currentArtistId) return;
            const files = e.target.files;
            if (files.length === 0) return;
            
            const statusDiv = document.getElementById('gallery-upload-status');
            statusDiv.textContent = `Enviando...`;

            const uploadPromises = Array.from(files).map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'artistas_uploads');
                return fetch(`https://api.cloudinary.com/v1_1/dj053fl2q/image/upload`, { method: 'POST', body: formData }).then(res => res.json());
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
                statusDiv.textContent = `Sucesso!`;
            } catch (error) { statusDiv.textContent = 'Erro.'; }
        }
    });

    grid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-image-btn')) {
            if (!confirm('Apagar?')) return;
            const url = e.target.dataset.url;
            try {
                await updateDoc(doc(db, 'artistas', currentArtistId), { imagens: arrayRemove(url) });
                const updatedDocSnap = await getDoc(doc(db, 'artistas', currentArtistId));
                renderizarGerenciadorDeGaleria(updatedDocSnap.data().imagens);
            } catch (error) { console.error(error); }
        }
    });
}

// --- 7. FUNÇÕES DE UI E DADOS (SITE PÚBLICO) ---

function criarLightbox(imageUrl) {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.id = 'lightbox-close';
    const img = document.createElement('img');
    img.src = escapeHTML(imageUrl);
    img.id = 'lightbox-image';
    overlay.appendChild(closeButton);
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => document.body.removeChild(overlay));
}

function criarCartaoArtista(artista) {
    const link = document.createElement('a');
    link.href = `#/galeria/${escapeHTML(artista.id)}`;
    link.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = escapeHTML(artista.imageUrl);
    img.className = 'gallery-image';
    img.loading = 'lazy';
    const nome = document.createElement('p');
    nome.textContent = artista.nome;
    nome.className = 'artist-card-name';
    link.appendChild(img);
    link.appendChild(nome);
    return link;
}

// --- 7.1 HERO BANNER (NETFLIX STYLE) ---
async function iniciarHeroBanner() {
    const banner = document.getElementById('hero-banner');
    const title = document.getElementById('hero-title');
    const text = document.getElementById('hero-text');
    const btn = document.getElementById('hero-link');
    
    if (!banner) return; 

    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        let listaArtistas = [];
        
        snapshot.forEach(doc => {
            const dados = doc.data();
            if (dados.imageUrl || (dados.imagens && dados.imagens.length > 0)) {
                listaArtistas.push({ id: doc.id, ...dados });
            }
        });

        if (listaArtistas.length === 0) return;

        const atualizarBanner = () => {
            const artistaSorteado = listaArtistas[Math.floor(Math.random() * listaArtistas.length)];
            let imagemFundo = artistaSorteado.imageUrl;
            if (artistaSorteado.imagens && artistaSorteado.imagens.length > 0) {
                imagemFundo = artistaSorteado.imagens[Math.floor(Math.random() * artistaSorteado.imagens.length)];
            }
            banner.style.backgroundImage = `url('${escapeHTML(imagemFundo)}')`;
            if (title) title.textContent = artistaSorteado.nome;
            if (text) text.textContent = `Confira as obras de ${artistaSorteado.nome}`;
            if (btn) btn.href = `#/galeria/${artistaSorteado.id}`;
        };

        atualizarBanner();
        if (heroInterval) clearInterval(heroInterval);
        heroInterval = setInterval(atualizarBanner, 10000); // 10 Segundos

    } catch (error) { console.error("Erro Hero:", error); }
}

// --- 7.2 CARROSSEL DE NOVOS ARTISTAS (CONFIGURADO PARA SVL, STR, GSR) ---
async function carregarNovosArtistas() {
    const wrapper = document.getElementById('wrapper-novos');
    if (!wrapper) return;

    // AQUI ESTÁ A LISTA QUE GARANTE A PRIORIDADE
    // Adicione mais nomes aqui se precisar. O código busca por esses nomes.
    const LISTA_MANUAL = [
        "GALERIA SVL",
        "GALERIA STR",
        "GALERIA GSR"
    ];

    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        let todosArtistas = [];
        
        snapshot.forEach(doc => {
            todosArtistas.push({ id: doc.id, ...doc.data() });
        });

        // FILTRA: Só pega quem está na lista manual
        let novosArtistas = todosArtistas.filter(artista => {
            // Verifica se o nome do artista está na lista manual (ignorando maiúsculas/minúsculas)
            // Se o nome no banco for "Galeria SVL", o toUpperCase() garante que ache "GALERIA SVL"
            return LISTA_MANUAL.some(nomeManual => 
                artista.nome && artista.nome.toUpperCase().includes(nomeManual.toUpperCase())
            );
        });

        // ORDENA: Garante que fiquem na ordem que você escreveu na lista
        novosArtistas.sort((a, b) => {
            const indexA = LISTA_MANUAL.findIndex(nome => a.nome.toUpperCase().includes(nome.toUpperCase()));
            const indexB = LISTA_MANUAL.findIndex(nome => b.nome.toUpperCase().includes(nome.toUpperCase()));
            return indexA - indexB;
        });

        // SE FALTAR GENTE (menos de 5), completa com o resto por data
        if (novosArtistas.length < 5) {
             const resto = todosArtistas.filter(a => !novosArtistas.includes(a));
             // Ordena o resto por data (do mais novo pro mais antigo)
             resto.sort((a, b) => {
                const dataA = a.criadoEm ? new Date(a.criadoEm) : new Date(0);
                const dataB = b.criadoEm ? new Date(b.criadoEm) : new Date(0);
                return dataB - dataA;
             });
             const faltam = 5 - novosArtistas.length;
             novosArtistas = novosArtistas.concat(resto.slice(0, faltam));
        }

        wrapper.innerHTML = '';
        
        novosArtistas.forEach(artista => {
            // LÓGICA DO LEQUE (FORÇAR 3 IMAGENS)
            let imgsGaleria = artista.imagens ? [...artista.imagens] : [];
            
            // Se não tiver imagens suficientes, repete para não quebrar o layout
            if (imgsGaleria.length === 0) {
                // Sem fotos na galeria? Usa a de perfil 3 vezes
                imgsGaleria = [artista.imageUrl, artista.imageUrl, artista.imageUrl];
            } else if (imgsGaleria.length === 1) {
                // 1 foto? Repete ela
                imgsGaleria = [imgsGaleria[0], imgsGaleria[0], imgsGaleria[0]];
            } else if (imgsGaleria.length === 2) {
                // 2 fotos? Repete a primeira
                imgsGaleria = [imgsGaleria[0], imgsGaleria[1], imgsGaleria[0]];
            }
            // Se tiver 3 ou mais, usa as 3 primeiras normalmente.

            const img1 = imgsGaleria[0];
            const img2 = imgsGaleria[1];
            const img3 = imgsGaleria[2];

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="container-bloco">
                    <div class="bloco-imagens">
                        <a href="#/galeria/${escapeHTML(artista.id)}">
                            <img src="${escapeHTML(img1)}" alt="Arte de ${escapeHTML(artista.nome)}">
                            <img src="${escapeHTML(img2)}" alt="Arte de ${escapeHTML(artista.nome)}">
                            <img src="${escapeHTML(img3)}" alt="Arte de ${escapeHTML(artista.nome)}">
                        </a>
                    </div>
                    <p class="legenda-galeria">${escapeHTML(artista.nome)}</p>
                </div>`;
            wrapper.appendChild(slide);
        });

        new Swiper('.novos-artistas-slider', {
            loop: novosArtistas.length > 1,
            speed: 1500,
            spaceBetween: 20,
            navigation: { 
                nextEl: '.novos-artistas-slider .swiper-button-next', 
                prevEl: '.novos-artistas-slider .swiper-button-prev' 
            },
            breakpoints: { 
                320: { slidesPerView: 1, slidesPerGroup: 1 }, 
                768: { slidesPerView: 2, slidesPerGroup: 1 },
                1024: { slidesPerView: 3, slidesPerGroup: 1 } 
            }
        });

    } catch (error) { 
        console.error("Erro novos artistas:", error); 
    }
}

// --- 7.3 CARROSSEL GERAL ---
async function carregarArtistasNoCarrossel() {
    const swiperWrapper = document.querySelector('.artistas-slider .swiper-wrapper');
    if (!swiperWrapper) return;
    try {
        const artistasCollection = collection(db, 'artistas');
        const snapshot = await getDocs(artistasCollection);
        let todosArtistas = [];
        snapshot.forEach(doc => { todosArtistas.push({ id: doc.id, ...doc.data() }); });
        
        swiperWrapper.innerHTML = '';
        todosArtistas.forEach(artista => {
            const img1 = (artista.imagens && artista.imagens[0]) || artista.imageUrl;
            const img2 = (artista.imagens && artista.imagens[1]) || img1;
            const img3 = (artista.imagens && artista.imagens[2]) || img2;
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<div class="container-bloco"><div class="bloco-imagens"><a href="#/galeria/${escapeHTML(artista.id)}"><img src="${escapeHTML(img1)}"><img src="${escapeHTML(img2)}"><img src="${escapeHTML(img3)}"></a></div><p class="legenda-galeria">Galeria ${escapeHTML(artista.nome)}</p></div>`;
            swiperWrapper.appendChild(slide);
        });

        new Swiper('.artistas-slider', {
            loop: todosArtistas.length > 4, 
            speed: 1500,
            navigation: { nextEl: '.artistas-slider .swiper-button-next', prevEl: '.artistas-slider .swiper-button-prev' },
            breakpoints: { 
                320: { slidesPerView: 1, slidesPerGroup: 1 }, 
                768: { slidesPerView: 3, slidesPerGroup: 3 }, 
                1024: { slidesPerView: 4, slidesPerGroup: 4 } 
            },
        });
    } catch (error) { console.error("Erro slider geral:", error); }
}

async function carregarGaleriaIndividual() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) return;
    try {
        const pathParts = window.location.hash.split('/');
        const artistaId = pathParts[2];
        if (!artistaId) throw new Error("ID não encontrado.");
        const docRef = doc(db, 'artistas', artistaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const artistaData = docSnap.data();
            document.title = `Galeria - ${escapeHTML(artistaData.nome)}`;
            document.getElementById('artista-logo').src = escapeHTML(artistaData.imageUrl);
            document.getElementById('artista-nome').textContent = artistaData.nome;
            const instagramLink = document.getElementById('artista-instagram-link');
            instagramLink.href = artistaData.instagramLink || '#';
            instagramLink.textContent = artistaData.instagramHandle || 'Ver Instagram';
            
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
                 galeriaContainer.innerHTML = '<p style="text-align: center; width: 100%;">Sem imagens.</p>';
            }
        }
    } catch (error) { console.error('Erro galeria:', error); }
}

async function carregarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    const filtrosContainer = document.getElementById('filtros-container');
    if (!gridContainer) return;
    try {
        const snapshot = await getDocs(query(collection(db, 'artistas'), orderBy("nome")));
        let todosArtistas = [];
        snapshot.forEach(doc => { todosArtistas.push({ id: doc.id, ...doc.data() }); });
        
        const renderizar = (lista) => {
            gridContainer.innerHTML = '';
            if (lista.length === 0) { gridContainer.innerHTML = '<p>Nenhum artista.</p>'; return; }
            lista.forEach(artista => { gridContainer.appendChild(criarCartaoArtista(artista)); });
        };

        if (filtrosContainer) {
            filtrosContainer.addEventListener('click', (event) => {
                if (event.target.tagName !== 'BUTTON') return;
                if(filtrosContainer.querySelector('.active')) filtrosContainer.querySelector('.active').classList.remove('active');
                event.target.classList.add('active');
                const cat = event.target.dataset.categoria;
                if (cat === 'todos') renderizar(todosArtistas);
                else renderizar(todosArtistas.filter(a => a.categoria && a.categoria.includes(cat)));
            });
        }
        renderizar(todosArtistas);
    } catch (error) { console.error("Erro página artistas:", error); }
}

// --- 8. ROTEADOR (SPA) ---
const routes = {
    '/home': '/pages/home.html',
    '/artistas': '/pages/artistas.html',
    '/quem-somos': '/pages/quem-somos.html',
    '/onde-atuamos': '/pages/onde-atuamos.html',
    '/galeria': '/pages/galeria.html',
    '/edit-profile': '/pages/edit-profile.html',
    '/login': '/pages/login.html',
    '/cadastro': '/pages/cadastro.html',
    '/admin': '/pages/admin.html',
    '/gerenciar-galeria': '/pages/gerenciar-galeria.html'
};

const loadContent = async () => {
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    const path = window.location.hash.substring(1) || '/home';
    const basePath = '/' + path.split('/')[1];
    const routeFile = routes[basePath] || '/pages/404.html';
    
    try {
        const response = await fetch(routeFile);
        if (!response.ok) throw new Error("Rota não encontrada.");
        const html = await response.text();
        contentDiv.innerHTML = html;

        if (basePath === '/galeria') {
            carregarGaleriaIndividual();
        } else if (basePath === '/edit-profile') {
            await carregarDadosParaEdicao();
            ativarFormularioEditArtista();
            ativarGerenciadorGaleria();
        } else if (basePath === '/gerenciar-galeria') {
            await carregarDadosParaGerenciarGaleria();
            ativarGerenciadorGaleria();
        } else if (basePath === '/home') {
            iniciarHeroBanner(); 
            carregarNovosArtistas(); // Carrega os fixos + resto
            carregarArtistasNoCarrossel(); 
        } else {
            if (heroInterval) clearInterval(heroInterval);
            
            if (basePath === '/artistas') {
                carregarPaginaDeArtistas();
            } else if (basePath === '/admin') {
                setupAdminPage();
                ativarBotoesAdmin();
                ativarFormularioAddArtista();
            } else if (basePath === '/login') {
                ativarFormularioLogin();
            } else if (basePath === '/cadastro') {
                ativarFormularioCadastro();
            }
        }

    } catch (error) { 
        console.error('Erro rota:', error); 
        contentDiv.innerHTML = '<h1>Erro ao carregar página.</h1>'; 
    }
};

// --- 9. INICIALIZAÇÃO ---
function initializeRouter() {
    window.addEventListener('hashchange', loadContent);
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    } else {
        loadContent();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeRouter();
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    if (hamburgerButton && mainNav) {
        hamburgerButton.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });
    }
});