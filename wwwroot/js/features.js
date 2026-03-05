function initFeaturesSwiper() {
    const swiperContainer = document.querySelector('.features-swiper');
    if (!swiperContainer || typeof Swiper === 'undefined') return;

    const swiper = new Swiper('.features-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        slidesPerView: 1.15,
        initialSlide: 1,
        loop: false,
        touchRatio: 1.5,
        longSwipesRatio: 0.1,
        threshold: 5,
        coverflowEffect: {
            rotate: 0,
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
                    rotate: 20,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: false,
                }
            }
        }
    });

    return swiper;
}