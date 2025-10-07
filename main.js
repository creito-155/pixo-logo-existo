// ===================================================================
// main.js - SPA completo para Pixo, logo existo
// ===================================================================

// --- 1. IMPORTAÇÕES E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const routes = {
    '/home': '/pages/home.html',
    '/artistas': '/pages/artistas.html',
    '/quem-somos': '/pages/quem-somos.html',
    '/onde-atuamos': '/pages/onde-atuamos.html',
    '/galeria': '/pages/galeria.html',
    '/edit-profile': '/pages/edit-profile.html',
    '/login': '/pages/login.html',
    '/cadastro': '/pages/cadastro.html',
    '/admin': '/pages/admin.html'
};

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

async function loadContent() {
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    const path = window.location.hash.substring(1) || '/home';
    let routeFile;
    if (path.startsWith('/galeria/')) {
        routeFile = routes['/galeria'];
    } else if (path.startsWith('/edit-profile/')) {
        routeFile = routes['/edit-profile'];
    } else {
        routeFile = routes[path] || '/pages/404.html';
    }
    try {
        const response = await fetch(routeFile);
        const html = await response.text();
        contentDiv.innerHTML = html;
        inicializarPagina(path);
        atualizarBarraSuperior();
    } catch (error) {
        contentDiv.innerHTML = '<h1>Erro ao carregar página.</h1>';
    }
}

function inicializarPagina(path) {
    if (path === '/home') inicializarHome();
    if (path === '/artistas') inicializarArtistas();
    if (path === '/galeria') inicializarGaleria();
    if (path === '/login') inicializarLogin();
    if (path === '/cadastro') inicializarCadastro();
    if (path === '/admin') inicializarAdmin();
    if (path.startsWith('/edit-profile')) inicializarEditProfile();
}

function inicializarHome() {
    const botaoRecomendados = document.getElementById('botao-recomendados');
    if (botaoRecomendados) {
        botaoRecomendados.addEventListener('click', async () => {
            await carregarArtistasRecomendados();
        });
    }
    carregarTodosArtistasHome();
}

async function carregarArtistasRecomendados() {
    const grid = document.getElementById('recomendados-grid');
    if (!grid) return;
    grid.innerHTML = 'Carregando...';

    const q = query(collection(db, "artistas"), where("recomendado", "==", true));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        grid.innerHTML = '<p>Nenhum artista recomendado encontrado.</p>';
        return;
    }

    let html = '';
    querySnapshot.forEach(doc => {
        const artista = doc.data();
        html += `
            <div class="artista-card">
                <img src="${artista.imageUrl}" alt="${artista.nome}" style="width:80px;">
                <h3>${artista.nome}</h3>
                <p>${artista.instagramHandle}</p>
            </div>
        `;
    });
    grid.innerHTML = html;
}

async function carregarTodosArtistasHome() {
    // Busca o grid principal (exclui o de recomendados)
    const grids = document.querySelectorAll('.gallery-grid');
    let grid = null;
    grids.forEach(g => {
        if (g.id !== 'recomendados-grid') grid = g;
    });
    if (!grid) return;
    grid.innerHTML = 'Carregando...';

    const snapshot = await getDocs(collection(db, "artistas"));
    if (snapshot.empty) {
        grid.innerHTML = '<p>Nenhum artista cadastrado.</p>';
        return;
    }
    let html = '';
    snapshot.forEach(doc => {
        const artista = doc.data();
        html += `
            <div class="artista-card">
                <img src="${artista.imageUrl}" alt="${artista.nome}" style="width:80px;">
                <h3>${artista.nome}</h3>
                <p>${artista.instagramHandle}</p>
                <p>${(artista.categoria || []).join(', ')}</p>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function inicializarArtistas() {
    const container = document.getElementById('lista-artistas');
    if (!container) return;
    container.innerHTML = 'Carregando...';

    getDocs(collection(db, "artistas")).then(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p>Nenhum artista cadastrado.</p>';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const artista = doc.data();
            html += `
                <div class="artista-card">
                    <img src="${artista.imageUrl}" alt="${artista.nome}" style="width:80px;">
                    <h3>${artista.nome}</h3>
                    <p>${artista.instagramHandle}</p>
                    <p>${(artista.categoria || []).join(', ')}</p>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

function inicializarGaleria() {
    const container = document.getElementById('galeria-artistas');
    if (!container) return;
    container.innerHTML = 'Carregando...';

    getDocs(collection(db, "artistas")).then(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p>Nenhuma imagem encontrada.</p>';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const artista = doc.data();
            if (Array.isArray(artista.imagens)) {
                artista.imagens.forEach(img => {
                    html += `
                        <div class="galeria-card">
                            <img src="${img}" alt="${artista.nome}" style="width:120px;">
                            <h4>${artista.nome}</h4>
                        </div>
                    `;
                });
            }
        });
        container.innerHTML = html;
    });
}

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

function inicializarAdmin() {
    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            signOut(auth).then(() => window.location.hash = '#/login');
        });
    }
    setupAdminPage();
}

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
            if (editProfileLink) {
                editProfileLink.href = `#/edit-profile/${artistaDoc.id}`;
            }
            if (createSection) createSection.style.display = 'none';
            if (editSection) editSection.style.display = 'block';
        }
    } catch (error) {
        if (loadingAdmin) {
            loadingAdmin.textContent = "Ocorreu um erro ao verificar seu perfil.";
            loadingAdmin.style.color = "red";
        }
    }

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
            const categoriasSelecionadas = Array.from(document.querySelectorAll('#categorias-opcoes input[name="categoria"]:checked'))
                .map(input => input.value);

            if (!nomeArtista || !imagemArquivo) {
                uploadStatus.textContent = 'Nome e Imagem são obrigatórios.';
                return;
            }
            if (categoriasSelecionadas.length === 0) {
                uploadStatus.textContent = 'Selecione pelo menos uma categoria.';
                return;
            }

            botaoSalvar.disabled = true;
            uploadStatus.textContent = 'Verificando artista...';

            try {
                const artistasRef = collection(db, 'artistas');
                const q = query(artistasRef, where("nome", "==", nomeArtista));
                const querySnapshot = await getDocs(q);

                let artistaId;

                if (!querySnapshot.empty) {
                    uploadStatus.textContent = 'Artista encontrado! Associando perfil...';
                    const artistaExistente = querySnapshot.docs[0];
                    artistaId = artistaExistente.id;
                } else {
                    uploadStatus.textContent = 'Artista novo! Criando perfil...';

                    const formData = new FormData();
                    formData.append('file', imagemArquivo);
                    formData.append('upload_preset', 'artistas_uploads');
                    const CLOUD_NAME = 'dj053fl2q';
                    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

                    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error.message || 'Falha no upload.');

                    const imageUrl = data.secure_url;

                    const novoArtistaDoc = await addDoc(artistasRef, {
                        userId: user.uid,
                        nome: escapeHTML(nomeArtista),
                        imageUrl: escapeHTML(imageUrl),
                        instagramHandle: escapeHTML(instagramHandle),
                        instagramLink: `https://www.instagram.com/${escapeHTML(instagramHandle.replace('@', ''))}`,
                        categoria: categoriasSelecionadas,
                        imagens: []
                    });
                    artistaId = novoArtistaDoc.id;
                }

                uploadStatus.textContent = 'Perfil associado/criado com sucesso!';
                uploadStatus.style.color = 'green';
                formAddArtista.reset();
                setupAdminPage();

            } catch (error) {
                uploadStatus.textContent = `Erro: ${error.message}`;
                uploadStatus.style.color = 'red';
            } finally {
                botaoSalvar.disabled = false;
            }
        });
    }
}

function inicializarEditProfile() {
    let artistaId = null;
    const hash = window.location.hash;
    if (hash.startsWith('#/edit-profile/')) {
        artistaId = hash.split('/')[2];
    }
    currentArtistId = artistaId;
    if (!currentArtistId) return;

    carregarDadosParaEdicao();

    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            signOut(auth).then(() => window.location.hash = '#/login');
        });
    }

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
                const categoriasSelecionadas = Array.from(document.querySelectorAll('#categorias-opcoes input[name="categoria"]:checked'))
                    .map(input => input.value);

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
            } catch (error) {
                updateStatus.textContent = `Erro: ${error.message}`;
                updateStatus.style.color = 'red';
            } finally {
                botaoAtualizar.disabled = false;
            }
        });
    }
}

async function carregarDadosParaEdicao() {
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
        }
    } catch (error) {
        const contentDiv = document.getElementById('app-content');
        if (contentDiv) contentDiv.innerHTML = '<h1>Erro ao carregar dados.</h1>';
    }
}

function atualizarBarraSuperior() {
    onAuthStateChanged(auth, async (user) => {
        const userProfileArea = document.getElementById('user-profile-area');
        if (userProfileArea) {
            if (user) {
                userProfileArea.innerHTML = `<a href="#/admin" class="login-button">Painel</a>`;
            } else {
                userProfileArea.innerHTML = `<a href="#/login" class="login-button">Login / Cadastrar</a>`;
            }
        }
    });
}

window.addEventListener('hashchange', loadContent);
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/home';
    }
    loadContent();
});