// Opções de configuração padrão para todos os carrosséis
const swiperOptions = {
  loop: true,
  speed: 800,
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 20,
      slidesPerGroup: 1,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 30,
      slidesPerGroup: 3,
    },
    1024: {
      slidesPerView: 5,
      spaceBetween: 40,
      slidesPerGroup: 5,
    }
  }
};

// Inicializa o Carrossel 1: Artistas
const artistasSwiper = new Swiper('.artistas-slider', {
  ...swiperOptions, // Usa as opções padrão
  navigation: {
    nextEl: '.swiper-button-next-artistas', // Botão "próximo" específico
    prevEl: '.swiper-button-prev-artistas', // Botão "anterior" específico
  },
});

// Inicializa o Carrossel 2: Recomendados
const recomendadosSwiper = new Swiper('.recomendados-slider', {
  ...swiperOptions, // Usa as opções padrão
  navigation: {
    nextEl: '.swiper-button-next-recomendados',
    prevEl: '.swiper-button-prev-recomendados',
  },
});

// Inicializa o Carrossel 3: Região Sul
const sulSwiper = new Swiper('.sul-slider', {
  ...swiperOptions, // Usa as opções padrão
  navigation: {
    nextEl: '.swiper-button-next-sul',
    prevEl: '.swiper-button-prev-sul',
  },
});

// Inicializa o Carrossel 4: Região Central
const centralSwiper = new Swiper('.central-slider', {
  ...swiperOptions, // Usa as opções padrão
  navigation: {
    nextEl: '.swiper-button-next-central',
    prevEl: '.swiper-button-prev-central',
  },
});