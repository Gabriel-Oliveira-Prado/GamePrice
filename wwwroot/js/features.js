function initFeaturesSwiper() {
    const swiperContainer = document.querySelector('.features-swiper');
    if (!swiperContainer) return;

    const swiper = new Swiper('.features-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        centeredSlidesBounds: true, /* Previne comportamento estranho nas bordas com poucos slides */
        slidesPerView: 1.15,
        initialSlide: 1,
        loop: false,
        touchRatio: 1.5,
        longSwipesRatio: 0.1,
        threshold: 5, /* Requer pequeno arrasto (5px) para não acidentalmente passar o slide num click */
        coverflowEffect: {
            rotate: 0, /* Tira a rotação confusa no celular */
            stretch: 10,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                coverflowEffect: {
                    rotate: 40,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: false,
                }
            },
            1200: {
                slidesPerView: 2,
                coverflowEffect: {
                    rotate: 20, /* Suavizando a rotação no desktop */
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: false,
                }
            }
        }
    });
}