// ==========================================
//  BASE DE DADOS DOS ARTISTAS
// ==========================================
const artistas = [
    {
        id: "LIGHT", // ID único (usado na URL, ex: ?artista=LIGHT)
        nome: "LIGHT_452",
        logo: "imagens/LIGHT/logo-LIGHT.webp",
        instagramHandle: "@LIGHT_452",
        instagramLink: "https://www.instagram.com/light_452",
        imagens: [
            "imagens/LIGHT/lIGHT-1.webp",
            "imagens/LIGHT/LIGHT-2.webp",
            "imagens/LIGHT/LIGHT-3.webp",
            "imagens/LIGHT/LIGHT-4,1.webp",
            "imagens/LIGHT/LIGHT-5,1.webp",
            "imagens/LIGHT/LIGHT-6,1.webp",
            "imagens/LIGHT/LIGHT-7.webp",
            "imagens/LIGHT/LIGHT-8.webp",
            "imagens/LIGHT/LIGHT-9.webp",
            "imagens/LIGHT/LIGHT-10.webp",
            "imagens/LIGHT/LIGHT-11.webp",
            "imagens/LIGHT/LIGHT-12.webp"
        ]
    },
    
    {
        id: "SVL",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "STR",
        nome: "STR-CREW | SILVASTR",
        logo: "imagens/STR/C0K3+STR.jpg",
        instagramHandle: "@Silvastr_",
        instagramLink: "https://www.instagram.com/silvastr_/",
        imagens: [
            "imagens/STR/NOX-STR.jpg",
            "imagens/STR/NOX-STR2.jpg",
            "imagens/STR/STR-1.jpg",
            "imagens/STR/STR-3.jpg",
            "imagens/STR/STR-2.jpg",
            "imagens/STR/STR-4.jpg",
            "imagens/STR/STR-5.jpg",
            "imagens/STR/STR-6.webp",
            "imagens/STR/STR-7.jpg",
            "imagens/STR/STR-GARE.jpg",
            "imagens/STR/STR+SECA-1.jpg",
            "imagens/STR/STR+SECA-2.jpg", 
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
        
        ]
    },
    {
        id: "TRIK",
        nome: "TRIK",
        logo: "imagens/TRIK/TRIK-2.JPG",
        instagramHandle: "@Silvastr_",
        instagramLink: "https://www.instagram.com/silvastr_/",
        imagens: [
            "imagens/TRIK/TRIK-1.JPG",
            "imagens/TRIK/TRIK-2.JPG",
            "imagens/TRIK/TRIK-3.JPG",
            "imagens/TRIK/TRIK-4.JPG",
            "imagens/TRIK/TRIK-CXS.JPG",
        
        ]
    },
    {
        id: "NOX",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "JOCA",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "C0K3",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "TRUE",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "JOKER",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "BUENO",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "IUGUE",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "SVL",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "SVL",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    {
        id: "SVL",
        nome: "SVL",
        logo: "imagens/SVL/logo-SVL.webp",
        instagramHandle: "@str_creito_",
        instagramLink: "https://www.instagram.com/STR_CREITO_",
        imagens: [
            "imagens/SVL/svl-gare.JPG",
            "imagens/SVL/SVL-BCT.jpg",
            "imagens/SVL/SVL-TELA.webp",
            "imagens/SVL/STR+SVL.JPG",
            "imagens/SVL/STR+SVL-1.JpG",
            "imagens/SVL/SVL-TRAJE.JpG",
            "imagens/SVL/SVL-TELA.webp", 
        ]
    },
    
];


// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DA GALERIA
// ==========================================
function montarGaleria() {
    // Procura por um elemento que só existe na página da galeria.
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) {
        // Se não encontrar, significa que não estamos na galeria.html, então não faz nada.
        return;
    }

    // Pega o parâmetro 'artista' da URL (ex: "LIGHT")
    const params = new URLSearchParams(window.location.search);
    const artistaId = params.get('artista');

    // Encontra o objeto do artista correspondente na nossa base de dados
    const artistaSelecionado = artistas.find(a => a.id === artistaId);

    if (artistaSelecionado) {
        // Se encontrou o artista, atualiza as informações da página
        document.title = `Galeria - ${artistaSelecionado.nome}`;
        document.getElementById('artista-logo').src = artistaSelecionado.logo;
        document.getElementById('artista-logo').alt = `Logo de ${artistaSelecionado.nome}`;
        document.getElementById('artista-nome').textContent = artistaSelecionado.nome;
        
        const instagramLinkElement = document.getElementById('artista-instagram-link');
        instagramLinkElement.href = artistaSelecionado.instagramLink;
        instagramLinkElement.textContent = artistaSelecionado.instagramHandle;

        // Limpa a galeria para garantir que está vazia
        galeriaContainer.innerHTML = '';

        // Cria e insere cada imagem na galeria
        artistaSelecionado.imagens.forEach(urlImagem => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';

            const imgElement = document.createElement('img');
            imgElement.src = urlImagem;
            imgElement.alt = `Arte de ${artistaSelecionado.nome}`;
            imgElement.className = 'gallery-image';
            imgElement.loading = 'lazy'; // Otimização de performance!

            itemDiv.appendChild(imgElement);
            galeriaContainer.appendChild(itemDiv);
        });

    } else {
        // Se não encontrou um artista com o ID da URL, mostra um erro
        document.querySelector('.creator-header').style.display = 'none';
        galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
    }
}


// ==========================================
//  INICIALIZAÇÃO DO SWIPER (Carrossel)
// ==========================================
// O código original do seu carrossel. Não precisa mexer aqui.
const artistasSwiper = new Swiper('.artistas-slider', {
  loop: true, 
  speed: 800,
  breakpoints: {
    320: {
      slidesPerView: 1,
      slidesPerGroup: 1,
    },
    768: {
      slidesPerView: 3,
      slidesPerGroup: 1,
    },
    1024: {
      slidesPerView: 4,
      slidesPerGroup: 1,
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// Roda a função de montar a galeria assim que a página é carregada
document.addEventListener('DOMContentLoaded', montarGaleria);