// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DE GALERIA INDIVIDUAL
// ==========================================
async function montarGaleria() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) {
        return; // Se não estiver na página da galeria, não faz nada.
    }

    try {
        const response = await fetch('/_data/artistas.json');
        if (!response.ok) {
            throw new Error('Rede respondeu com um erro.');
        }
        const data = await response.json();
        const artistas = data.lista_de_artistas; 

        const params = new URLSearchParams(window.location.href.split('?')[1]);
        const artistaId = params.get('artista');
        const artistaSelecionado = artistas.find(a => a.id.toLowerCase() === artistaId.toLowerCase());

        if (artistaSelecionado) {
            document.title = `Galeria - ${artistaSelecionado.nome}`;
            document.getElementById('artista-logo').src = artistaSelecionado.logo;
            document.getElementById('artista-logo').alt = `Logo de ${artistaSelecionado.nome}`;
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
                imgElement.alt = `Arte de ${artistaSelecionado.nome}`;
                imgElement.className = 'gallery-image';
                imgElement.loading = 'lazy';

                // --- NOVIDADE AQUI: Adiciona o evento de clique para abrir a lightbox ---
                imgElement.addEventListener('click', () => {
                    criarLightbox(urlImagem);
                });

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
//  FUNÇÃO PARA CRIAR E EXIBIR A LIGHTBOX (IMAGEM EXPANDIDA)
// ==========================================
function criarLightbox(imageUrl) {
    // Cria o fundo preto
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';

    // Cria a imagem que será exibida
    const image = document.createElement('img');
    image.id = 'lightbox-image';
    image.src = imageUrl;

    // Cria o botão de fechar (X)
    const closeButton = document.createElement('span');
    closeButton.id = 'lightbox-close';
    closeButton.innerHTML = '&times;'; // Símbolo 'X'

    // Adiciona a funcionalidade de fechar a lightbox
    function fecharLightbox() {
        document.body.removeChild(overlay);
    }

    closeButton.addEventListener('click', fecharLightbox);
    // Também fecha ao clicar fora da imagem
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharLightbox();
        }
    });
    // Fecha com a tecla 'Escape'
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
            fecharLightbox();
        }
    }, { once: true }); // O evento é removido após ser disparado uma vez

    // Monta a lightbox
    overlay.appendChild(image);
    overlay.appendChild(closeButton);

    // Adiciona a lightbox à página
    document.body.appendChild(overlay);
}


// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DE TODOS OS ARTISTAS
// ==========================================
async function montarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    if (!gridContainer) {
        return;
    }

    try {
        const response = await fetch('/_data/artistas.json');
        const data = await response.json();
        const artistas = data.lista_de_artistas;

        gridContainer.innerHTML = ''; 

        artistas.forEach(artista => {
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
            gridContainer.appendChild(link);
        });

    } catch (error) {
        console.error("Erro ao montar a página de artistas:", error);
        gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar os artistas.</p>';
    }
}

// ==========================================
//  INICIALIZAÇÃO DO SWIPER (Carrossel)
// ==========================================
function inicializarSwiper() {
    const sliderElement = document.querySelector('.artistas-slider');

    // Só inicia o Swiper se o elemento do carrossel existir na página.
    if (sliderElement && typeof Swiper !== 'undefined') {
        const artistasSwiper = new Swiper(sliderElement, {
            loop: true, 
            speed: 800,
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
// Roda todas as funções quando a página carrega.
// Cada função tem uma verificação interna para só executar na página correta.
document.addEventListener('DOMContentLoaded', () => {
    montarGaleria();
    montarPaginaDeArtistas();
    inicializarSwiper();
});

