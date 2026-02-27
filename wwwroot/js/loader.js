document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';

    // If multiple loader containers exist (duplicated markup), keep only the first
    try {
        const loaders = document.querySelectorAll('.loader-container');
        if (loaders && loaders.length > 1) {
            for (let i = 1; i < loaders.length; i++) {
                loaders[i].parentNode && loaders[i].parentNode.removeChild(loaders[i]);
            }
            console.warn('Multiple loader containers detected. Extra instances removed.');
        }
    } catch (e) {
        // ignore
    }
    // Removed forced hide fallback so preloader truly waits for page load.
    // Provide a manual "Continuar" button if resources hang (user can dismiss).

    // --- Preloader ---
    // Inicializa a timeline do Hero (mas pausada)
    const heroTimeline = typeof initHeroAnimations === 'function' ? initHeroAnimations() : null;

    // No circular loader: removed ring animation to keep single loading indicator

    // Indeterminate loading bar animation while waiting for full load
    let waitingAnim = null;
    try {
        waitingAnim = anime({
            targets: '.loading-bar',
            width: ['0%', '80%'],
            duration: 2000,
            easing: 'linear',
            loop: true,
            direction: 'alternate'
        });
    } catch (e) { }

    function finalizeLoader() {
        try {
            // stop waiting animations
            if (waitingAnim && waitingAnim.pause) waitingAnim.pause();

            const loadingBar = document.querySelector('.loading-bar');
            const loaderContent = document.querySelector('.loader-content');
            const loader = document.querySelector('.loader-container');

            // Prefer anime.js animation if available, otherwise fall back to CSS changes
            if (typeof anime === 'function') {
                anime({
                    targets: '.loading-bar',
                    width: '100%',
                    duration: 600,
                    easing: 'easeInOutSine'
                });

                anime({
                    targets: '.loader-content',
                    opacity: [1, 0],
                    translateY: [0, -10],
                    duration: 500,
                    delay: 420,
                    easing: 'easeInQuad',
                    complete: () => {
                        if (loader) {
                            loader.classList.add('hidden');
                            setTimeout(() => {
                                loader.style.display = 'none';
                                loader.setAttribute('aria-hidden', 'true');
                            }, 560);
                        }
                    }
                });
            } else {
                // fallback: immediate style updates
                if (loadingBar) loadingBar.style.width = '100%';
                if (loaderContent) loaderContent.style.opacity = '0';
                if (loader) {
                    loader.classList.add('hidden');
                    setTimeout(() => {
                        loader.style.display = 'none';
                        loader.setAttribute('aria-hidden', 'true');
                    }, 600);
                }
            }

            // Ensure scrolling is re-enabled
            document.body.style.overflow = '';

            // Start rest of page scripts/animations even if anime is missing
            try { if (heroTimeline) heroTimeline.play(); } catch (e) { }
            try { if (typeof initScrollReveal === 'function') initScrollReveal(); } catch (e) { }
            try { if (typeof initSearch === 'function') initSearch(); } catch (e) { }
            try { if (typeof initFeaturesSwiper === 'function') initFeaturesSwiper(); } catch (e) { }
            try { if (typeof initTypewriter === 'function') initTypewriter(); } catch (e) { }
            try { if (typeof initDeals === 'function') initDeals(); } catch (e) { }
            try { if (typeof initBadgeInteractivity === 'function') initBadgeInteractivity(); } catch (e) { }
            try { if (typeof initScrollEffects === 'function') initScrollEffects(); } catch (e) { }
            try { if (typeof initBackgroundGlow === 'function') initBackgroundGlow(); } catch (e) { }
        } catch (err) {
            // final safety fallback: hide loader and allow interaction
            console.error('finalizeLoader error', err);
            const loader = document.querySelector('.loader-container');
            if (loader) {
                loader.style.display = 'none';
                loader.setAttribute('aria-hidden', 'true');
            }
            document.body.style.overflow = '';
        }
    }

    // Non-blocking visual touches while waiting for full load
    try {
        if (typeof anime === 'function') {
            anime({
                targets: '.logo-path',
                strokeDashoffset: [anime.setDashoffset, 0],
                duration: 1200,
                easing: 'easeInOutSine'
            });

            anime({
                targets: '.loader-text',
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 600,
                easing: 'easeOutExpo',
                delay: 300
            });
        }
    } catch (e) { }

    // Finalize when the full window load event fires
    window.addEventListener('load', function () {
        finalizeLoader();
    });

    // Provide a manual skip after some time if user wants to continue (no forced hide)
    const skipBtn = document.querySelector('.loader-skip-btn');
    let skipShown = false;
    setTimeout(() => {
        if (skipBtn) {
            skipBtn.style.display = 'inline-block';
            skipShown = true;
            const sub = document.querySelector('.loader-subtext');
            if (sub) sub.textContent = 'Carregamento lento — você pode continuar manualmente.';
        }
    }, 8000);
    if (skipBtn) skipBtn.addEventListener('click', () => finalizeLoader());

    // If multiple resource errors occur (blocked CDNs etc.), show skip earlier
    let resourceErrorCount = 0;
    function revealSkipEarly() {
        const skip = document.querySelector('.loader-skip-btn');
        if (skip && !skipShown) {
            skip.style.display = 'inline-block';
            skipShown = true;
            const sub = document.querySelector('.loader-subtext');
            if (sub) sub.textContent = 'Alguns recursos falharam ao carregar — você pode continuar.';
        }
    }

    window.addEventListener('error', (e) => {
        try {
            const target = e && e.target;
            if (target && (target.src || target.href)) {
                resourceErrorCount++;
                if (resourceErrorCount >= 3) revealSkipEarly();
            }
        } catch (ex) { }
    }, true);
});