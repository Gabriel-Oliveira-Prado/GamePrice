document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';

    // --- SEGURANÇA ---
    setTimeout(() => {
        const loader = document.querySelector('.loader-container');
        if (loader && getComputedStyle(loader).display !== 'none') {
            console.warn("Loader demorou muito. Forçando exibição.");
            loader.style.display = 'none';
            document.body.style.overflow = '';
            document.querySelectorAll('.gs-reveal').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            // Tenta iniciar animações mesmo se o loader falhar
            if (typeof initHeroAnimations === 'function') {
                const tl = initHeroAnimations();
                if (tl) tl.play();
            }
        }
    }, 3000);

    // --- Preloader ---
    // Inicializa a timeline do Hero (mas pausada)
    const heroTimeline = typeof initHeroAnimations === 'function' ? initHeroAnimations() : null;

    const loaderTimeline = anime.timeline({
        easing: 'easeInOutQuad',
        complete: () => {
            document.body.style.overflow = '';

            // Inicia animações da Home
            if (heroTimeline) heroTimeline.play();

            // Inicializa componentes
            if (typeof initScrollReveal === 'function') initScrollReveal();
            if (typeof initSearch === 'function') initSearch();
            if (typeof initFeaturesSwiper === 'function') initFeaturesSwiper();
            if (typeof initTypewriter === 'function') initTypewriter();
            if (typeof initDeals === 'function') initDeals();

            // Efeitos visuais
            if (typeof initBadgeInteractivity === 'function') initBadgeInteractivity();
            if (typeof initScrollEffects === 'function') initScrollEffects();
            if (typeof initBackgroundGlow === 'function') initBackgroundGlow();
        }
    });

    loaderTimeline.add({
        targets: '.logo-path',
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1200,
        easing: 'easeInOutSine'
    })
        .add({
            targets: '.loader-text',
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 600,
            easing: 'easeOutExpo'
        }, '-=400')
        .add({
            targets: '.logo-path',
            fill: '#0d6efd',
            duration: 800,
            easing: 'easeOutExpo'
        }, '-=400')
        .add({
            targets: ".loading-bar",
            width: "100%",
            duration: 800,
            easing: 'easeInOutSine'
        }, '-=800')
        .add({
            targets: ".loader-content",
            scale: 1.1,
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            delay: 200
        })
        .add({
            targets: ".loader-container",
            opacity: 0,
            duration: 500,
            easing: 'linear',
            complete: function () {
                const container = document.querySelector('.loader-container');
                if (container) {
                    container.style.visibility = 'hidden';
                    container.style.pointerEvents = 'none';
                    container.style.display = 'none';
                }
            }
        }, '-=300');
});