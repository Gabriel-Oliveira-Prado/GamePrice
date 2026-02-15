function initFeaturesSwiper() {
    const swiperContainer = document.querySelector('.features-swiper');
    if (!swiperContainer) return;
    const wrapper = swiperContainer.querySelector('.swiper-wrapper');
    const slides = wrapper.querySelectorAll('.swiper-slide');
    for (let i = 0; i < 2; i++) {
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            wrapper.appendChild(clone);
        });
    }
    const swiper = new Swiper('.features-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1,
        loop: true,
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
        autoplay: {
            delay: 6500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3,
                coverflowEffect: { rotate: 30, depth: 100 }
            }
        }
    });
}