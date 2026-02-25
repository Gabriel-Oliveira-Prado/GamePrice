document.addEventListener('DOMContentLoaded', function () {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    let scrollTimeout;

    if (!navbar) return;

    if (window.scrollY < 50) {
        navbar.classList.add('navbar-transparent');
    }

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        clearTimeout(scrollTimeout);

        if (scrollTop < 50) {
            navbar.classList.add('navbar-transparent');
        } else {
            navbar.classList.remove('navbar-transparent');
        }

        // Verifica se o menu mobile está aberto para não esconder a navbar
        const collapse = navbar.querySelector('.navbar-collapse');
        if (collapse && (collapse.classList.contains('show') || collapse.classList.contains('collapsing'))) {
            navbar.classList.remove('navbar-hidden');
            return;
        }

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        scrollTimeout = setTimeout(() => {
            navbar.classList.remove('navbar-hidden');
        }, 1200);
    });

    const collapse = navbar.querySelector('.navbar-collapse');
    if (collapse) {
        collapse.addEventListener('show.bs.collapse', function () {
            navbar.classList.add('mobile-menu-open');
            navbar.classList.remove('navbar-transparent');
        });
        collapse.addEventListener('hidden.bs.collapse', function () {
            navbar.classList.remove('mobile-menu-open');
            if (window.scrollY < 50) {
                navbar.classList.add('navbar-transparent');
            }
        });
    }
});