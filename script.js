// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DA GALERIA
// ==========================================

async function montarGaleria() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) { return; }

    try {
        const response = await fetch('/_data/artistas.json');
        if (!response.ok) { throw new Error('Rede respondeu com um erro.'); }

        const data = await response.json();
        // A CORREÇÃO ESTÁ AQUI: Acedemos à lista dentro do ficheiro JSON
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
            artistaSelecionado.imagens.forEach(imgData => {
                const urlImagem = typeof imgData === 'string' ? imgData : imgData.imagem;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';

                const imgElement = document.createElement('img');
                imgElement.src = urlImagem;
                imgElement.alt = `Arte de ${artistaSelecionado.nome}`;
                imgElement.className = 'gallery-image';
                imgElement.loading = 'lazy';

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
//  INICIALIZAÇÃO DO SWIPER (Carrossel)
// ==========================================
const sliderElement = document.querySelector('.artistas-slider');
if (sliderElement) {
  const artistasSwiper = new Swiper(sliderElement, {
    loop: true, speed: 800,
    breakpoints: {
      320: { slidesPerView: 1, slidesPerGroup: 1 },
      768: { slidesPerView: 3, slidesPerGroup: 1 },
      1024: { slidesPerView: 4, slidesPerGroup: 1 }
    },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  });
}

// Roda a função de montar a galeria assim que a página é carregada
document.addEventListener('DOMContentLoaded', montarGaleria);