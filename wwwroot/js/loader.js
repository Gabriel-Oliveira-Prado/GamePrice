(function() {
    'use strict';

    let isLoaderFinalized = false;
    let skipTimeout = null;
    let hideLoaderTimeout = null;
    let resourceErrorCount = 0;
    let skipShown = false;

    const state = {
        heroTimeline: null,
        loadingBar: null,
        skipBtn: null
    };

    function removeDuplicateLoaders() {
        const loaders = document.querySelectorAll('.loader-container');
        if (loaders.length > 1) {
            for (let i = 1; i < loaders.length; i++) {
                const parent = loaders[i].parentNode;
                if (parent) parent.removeChild(loaders[i]);
            }
            console.warn('Multiple loader containers detected. Extra instances removed.');
        }
    }

    function initHeroTimeline() {
        if (typeof initHeroAnimations === 'function') {
            try {
                state.heroTimeline = initHeroAnimations();
            } catch (e) {
                console.error('Failed to initialize hero animations:', e);
            }
        }
    }

    function setupLoadingBar() {
        state.loadingBar = document.querySelector('.loading-bar');
        if (state.loadingBar) {
            state.loadingBar.classList.add('loading-active');
        }
    }

    function stopLoadingAnimation() {
        if (state.loadingBar) {
            state.loadingBar.classList.remove('loading-active');
        }
    }

    function hideLoader(loader) {
        if (!loader) return;

        loader.classList.add('hidden');
        hideLoaderTimeout = setTimeout(() => {
            loader.style.display = 'none';
            loader.setAttribute('aria-hidden', 'true');
        }, 560);
    }

    function initializePageFunctions() {
        const functions = [
            { fn: state.heroTimeline?.play, name: 'heroTimeline.play' },
            { fn: window.initScrollReveal, name: 'initScrollReveal' },
            { fn: window.initSearch, name: 'initSearch' },
            { fn: window.initFeaturesSwiper, name: 'initFeaturesSwiper' },
            { fn: window.initDeals, name: 'initDeals' },
            { fn: window.initBadgeInteractivity, name: 'initBadgeInteractivity' },
            { fn: window.initScrollEffects, name: 'initScrollEffects' },
            { fn: window.initBackgroundGlow, name: 'initBackgroundGlow' }
        ];

        functions.forEach(({ fn, name }) => {
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (e) {
                    console.warn(`Failed to initialize ${name}:`, e);
                }
            }
        });
    }

    function finalizeLoader() {
        if (isLoaderFinalized) return;
        isLoaderFinalized = true;

        if (skipTimeout) clearTimeout(skipTimeout);
        if (hideLoaderTimeout) clearTimeout(hideLoaderTimeout);

        stopLoadingAnimation();

        const loadingBar = document.querySelector('.loading-bar');
        const loaderContent = document.querySelector('.loader-content');
        const loader = document.querySelector('.loader-container');

        document.body.style.overflow = '';

        const hasAnime = typeof anime === 'function';

        if (hasAnime && loadingBar && loaderContent) {
            try {
                anime({
                    targets: loadingBar,
                    width: '100%',
                    duration: 600,
                    easing: 'easeInOutSine'
                });

                anime({
                    targets: loaderContent,
                    opacity: [1, 0],
                    translateY: [0, -10],
                    duration: 500,
                    delay: 420,
                    easing: 'easeInQuad',
                    complete: () => hideLoader(loader)
                });
            } catch (e) {
                console.warn('Anime.js animation failed:', e);
                hideLoader(loader);
            }
        } else {
            if (loadingBar) loadingBar.style.width = '100%';
            if (loaderContent) loaderContent.style.opacity = '0';
            hideLoader(loader);
        }

        initializePageFunctions();
    }

    function initLogoAnimations() {
        if (typeof anime !== 'function') return;

        try {
            const logoPath = document.querySelector('.logo-path');
            const loaderText = document.querySelector('.loader-text');

            if (logoPath) {
                anime({
                    targets: logoPath,
                    strokeDashoffset: [anime.setDashoffset, 0],
                    duration: 1200,
                    easing: 'easeInOutSine'
                });
            }

            if (loaderText) {
                anime({
                    targets: loaderText,
                    opacity: [0, 1],
                    translateY: [15, 0],
                    duration: 600,
                    easing: 'easeOutExpo',
                    delay: 300
                });
            }
        } catch (e) {
            console.warn('Logo animation failed:', e);
        }
    }

    function setupSkipButton() {
        state.skipBtn = document.querySelector('.loader-skip-btn');
        if (!state.skipBtn) return;

        state.skipBtn.addEventListener('click', finalizeLoader);

        skipTimeout = setTimeout(() => {
            if (isLoaderFinalized) return;
            revealSkipButton('Carregamento lento — você pode continuar manualmente.');
        }, 8000);
    }

    function revealSkipButton(message) {
        if (skipShown || isLoaderFinalized || !state.skipBtn) return;

        state.skipBtn.style.display = 'inline-block';
        skipShown = true;

        const subtext = document.querySelector('.loader-subtext');
        if (subtext && message) subtext.textContent = message;
    }

    function handleResourceError(e) {
        const target = e?.target;
        if (target && (target.src || target.href)) {
            resourceErrorCount++;
            if (resourceErrorCount >= 3) {
                revealSkipButton('Alguns recursos falharam ao carregar — você pode continuar.');
            }
        }
    }

    function cleanup() {
        if (skipTimeout) clearTimeout(skipTimeout);
        if (hideLoaderTimeout) clearTimeout(hideLoaderTimeout);
        window.removeEventListener('load', finalizeLoader);
        window.removeEventListener('error', handleResourceError, true);
    }

    function init() {
        document.body.style.overflow = 'hidden';

        removeDuplicateLoaders();
        initHeroTimeline();
        setupLoadingBar();
        initLogoAnimations();
        setupSkipButton();

        window.addEventListener('load', finalizeLoader);
        window.addEventListener('error', handleResourceError, true);
        window.addEventListener('beforeunload', cleanup);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();