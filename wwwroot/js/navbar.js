(function() {
    'use strict';

    let lastScrollTop = 0;
    let scrollTimeout;
    let ticking = false;

    function initNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY < 50) {
            navbar.classList.add('navbar-transparent');
        }

        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    clearTimeout(scrollTimeout);

                    if (scrollTop < 50) {
                        navbar.classList.add('navbar-transparent');
                    } else {
                        navbar.classList.remove('navbar-transparent');
                    }

                    const collapse = navbar.querySelector('.navbar-collapse');
                    const isMenuOpen = collapse && 
                        (collapse.classList.contains('show') || collapse.classList.contains('collapsing'));

                    if (isMenuOpen) {
                        navbar.classList.remove('navbar-hidden');
                        ticking = false;
                        return;
                    }

                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        navbar.classList.add('navbar-hidden');
                    } else {
                        navbar.classList.remove('navbar-hidden');
                    }

                    lastScrollTop = Math.max(0, scrollTop);

                    scrollTimeout = setTimeout(() => {
                        navbar.classList.remove('navbar-hidden');
                    }, 1200);

                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });

        const collapse = navbar.querySelector('.navbar-collapse');
        if (collapse) {
            collapse.addEventListener('show.bs.collapse', () => {
                navbar.classList.add('mobile-menu-open');
                navbar.classList.remove('navbar-transparent');
            });

            collapse.addEventListener('hidden.bs.collapse', () => {
                navbar.classList.remove('mobile-menu-open');
                if (window.scrollY < 50) {
                    navbar.classList.add('navbar-transparent');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();