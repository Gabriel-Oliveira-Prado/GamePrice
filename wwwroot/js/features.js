function initFeaturesSwiper() {
    const swiperContainer = document.querySelector('.features-swiper');
    if (!swiperContainer) return;

    // Configuração oficial do Swiper para loop infinito em Coverflow
    // Duplicar os slides originais via DOM para garantir que telas grandes rodem perfeitamente
    const wrapper = swiperContainer.querySelector('.swiper-wrapper');
    const originalSlides = wrapper.querySelectorAll('.swiper-slide');

    // Adicionar 2 cópias de todos os slides (total de 9 slides se forem 3 originais)
    // Isso garante conteúdo suficiente para swiper loop em telas ultrawide (slidesPerView: 3)
    for (let i = 0; i < 2; i++) {
        originalSlides.forEach(slide => {
            wrapper.appendChild(slide.cloneNode(true));
        });
    }

    const swiper = new Swiper('.features-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1.15, /* Pedaço do próximo slide visível no Mobile */
        loop: true,
        coverflowEffect: {
            rotate: 0, /* Tira a rotação confusa no celular */
            stretch: 10,
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
        loopAdditionalSlides: 3, // Importante para evitar "pulos" quando o loop recomeça
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
                slidesPerView: 3,
                coverflowEffect: {
                    rotate: 30,
                    stretch: 0,
                    depth: 150,
                    modifier: 1,
                    slideShadows: false,
                }
            }
        }
    });
}