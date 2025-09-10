// ==========================================
//  FUNÇÃO AUXILIAR PARA CRIAR CARTÕES DE ARTISTA
// ==========================================
function criarCartaoArtista(artista) {
    const link = document.createElement('a');
    link.href = `galeria.html?artista=${artista.id}`;
    link.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = artista.logo;
    img.alt = `Logo do artista ${artista.nome}`;
    img.className = 'gallery-image';
    img.loading = 'lazy';

    const nome = document.createElement('p');
    nome.textContent = artista.nome;
    nome.className = 'artist-card-name';

    link.appendChild(img);
    link.appendChild(nome);
    return link;
}


// ==========================================
//  LÓGICA PARA A PÁGINA PRINCIPAL (SORTEIO DE RECOMENDADOS)
// ==========================================
async function montarPaginaHome() {
    const recomendadosGrid = document.getElementById('recomendados-grid');
    // Só executa se o elemento existir na página
    if (!recomendadosGrid) return;

    try {
        const response = await fetch('/_data/artistas.json');
        const data = await response.json();
        let todosArtistas = data.lista_de_artistas;
        
        // Embaralha a lista de artistas para o sorteio
        todosArtistas.sort(() => 0.5 - Math.random());
        
        // Pega os primeiros 4 artistas da lista embaralhada
        const selecionados = todosArtistas.slice(0, 4);

        recomendadosGrid.innerHTML = '';
        selecionados.forEach(artista => {
            recomendadosGrid.appendChild(criarCartaoArtista(artista));
        });
    } catch (error) {
        console.error("Erro ao buscar artistas recomendados:", error);
        recomendadosGrid.innerHTML = "<p>Não foi possível carregar os artistas recomendados.</p>";
    }
}


// ==========================================
//  LÓGICA PARA A PÁGINA DE GALERIA INDIVIDUAL
// ==========================================
async function montarGaleria() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) return;

    try {
        const response = await fetch('/_data/artistas.json');
        const data = await response.json();
        const artistas = data.lista_de_artistas; 

        const params = new URLSearchParams(window.location.href.split('?')[1]);
        const artistaId = params.get('artista');
        const artistaSelecionado = artistas.find(a => a.id.toLowerCase() === artistaId.toLowerCase());

        if (artistaSelecionado) {
            document.title = `Galeria - ${artistaSelecionado.nome}`;
            document.getElementById('artista-logo').src = artistaSelecionado.logo;
            document.getElementById('artista-nome').textContent = artistaSelecionado.nome;
            
            const instagramLinkElement = document.getElementById('artista-instagram-link');
            instagramLinkElement.href = artistaSelecionado.instagramLink;
            instagramLinkElement.textContent = artistaSelecionado.instagramHandle;

            galeriaContainer.innerHTML = '';
            artistaSelecionado.imagens.forEach(urlImagem => {
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
            document.querySelector('.creator-header').style.display = 'none';
            galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
        }
    } catch (error) {
        console.error('Erro ao carregar dados da galeria:', error);
        galeriaContainer.innerHTML = '<h1>Ocorreu um erro ao carregar o conteúdo.</h1>';
    }
}


// ==========================================
//  LÓGICA PARA A PÁGINA DE TODOS OS ARTISTAS (COM FILTROS)
// ==========================================
async function montarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    const filtrosContainer = document.getElementById('filtros-container');
    if (!gridContainer) return;

    try {
        const response = await fetch('/_data/artistas.json');
        const data = await response.json();
        const todosArtistas = data.lista_de_artistas;

        // Função para renderizar os artistas na grelha
        const renderizarArtistas = (listaDeArtistas) => {
            gridContainer.innerHTML = ''; 
            if (listaDeArtistas.length === 0) {
                gridContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum artista encontrado nesta categoria.</p>';
                return;
            }
            listaDeArtistas.forEach(artista => {
                gridContainer.appendChild(criarCartaoArtista(artista));
            });
        };

        // Adiciona o "ouvinte" para os cliques nos botões
        filtrosContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filtro-btn')) {
                filtrosContainer.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');

                const categoriaFiltro = event.target.dataset.categoria;

                if (categoriaFiltro === 'todos') {
                    renderizarArtistas(todosArtistas);
                } else {
                    // LÓGICA DE FILTRO ATUALIZADA PARA MÚLTIPLAS CATEGORIAS
                    const artistasFiltrados = todosArtistas.filter(artista => {
                        // Verifica se o artista tem a propriedade 'categoria', se é uma lista (array)
                        // e se a lista de categorias do artista (em minúsculas) INCLUI a categoria do filtro.
                        return artista.categoria && Array.isArray(artista.categoria) && artista.categoria.map(c => c.toLowerCase()).includes(categoriaFiltro.toLowerCase());
                    });
                    renderizarArtistas(artistasFiltrados);
                }
            }
        });
        
        renderizarArtistas(todosArtistas);

    } catch (error) {
        console.error("Erro ao montar a página de artistas:", error);
        gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar os artistas.</p>';
    }
}


// ==========================================
//  FUNÇÃO PARA CRIAR E EXIBIR A LIGHTBOX
// ==========================================
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
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    }, { once: true });
}


// ==========================================
//  INICIALIZAÇÃO DO SWIPER (Carrossel)
// ==========================================
function inicializarSwiper() {
    const sliderElement = document.querySelector('.artistas-slider');
    if (sliderElement && typeof Swiper !== 'undefined') {
        const artistasSwiper = new Swiper(sliderElement, {
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


// ==========================================
//  INICIALIZAÇÃO GERAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    montarPaginaHome();
    montarGaleria();
    montarPaginaDeArtistas();
    inicializarSwiper();
});

