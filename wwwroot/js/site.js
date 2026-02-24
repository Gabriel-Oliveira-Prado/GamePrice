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
            if (typeof heroTimeline !== 'undefined') heroTimeline.play();
        }
    }, 3000);
    // --- Preloader ---
    const loaderTimeline = anime.timeline({
        easing: 'easeInOutQuad',
        complete: () => {
            document.body.style.overflow = '';
            heroTimeline.play();
            initScrollReveal();
            initSearch();
            initFeaturesSwiper();
            initTypewriter();
            initDeals(); // Inicializa a seção de ofertas
        }
    });
    loaderTimeline.add({
        targets: '.logo-path',
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1500,
        easing: 'easeInOutSine'
    })
        .add({
            targets: '.logo-path',
            fill: '#0d6efd',
            duration: 800,
            easing: 'easeOutExpo'
        })
        .add({
            targets: ".loading-bar",
            width: "100%",
            duration: 1500,
            easing: 'easeInOutSine'
        }, '-=1500')
        .add({
            targets: ".loader-container",
            translateY: "-100%",
            duration: 500,
            delay: 100
        });
    // --- Hero ---
    const heroTimeline = anime.timeline({
        autoplay: false,
        easing: 'easeOutExpo'
    });
    heroTimeline.add({
        targets: [".hero-title", ".hero-section p.lead"],
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: anime.stagger(100),
        easing: 'easeOutElastic(1, .6)'
    })
        .add({
            targets: ".search-container",
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutBack'
        }, '-=800')
        .add({
            targets: ".hero-section .badge",
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 500
        }, '-=800');
    // --- Scroll Reveal ---
    const revealElements = document.querySelectorAll('.gs-reveal');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px) scale(0.9)';
    });
    const initScrollReveal = () => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: 0,
                        scale: 1,
                        opacity: 1,
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const count = { val: 0 };
                        anime({
                            targets: count,
                            val: [0, target],
                            round: 1,
                            easing: 'easeOutExpo',
                            duration: 5000,
                            update: function () {
                                counter.textContent = count.val;
                            }
                        });
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealElements.forEach(el => observer.observe(el));
    };
    // --- Badge Interativo ---
    const badge = document.querySelector('.hero-section .badge');
    if (badge) {
        badge.style.cursor = 'grab';
        badge.style.userSelect = 'none';
        let isDragging = false;
        let startX, startY;
        let initialTranslateX = 0;
        let initialTranslateY = 0;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        let vx = 0, vy = 0, lastX = 0, lastY = 0, lastTime = 0;
        const startDrag = (e) => {
            isDragging = true;
            startX = (e.clientX || e.touches[0].clientX);
            startY = (e.clientY || e.touches[0].clientY);
            lastX = startX; lastY = startY; lastTime = Date.now();
            const style = window.getComputedStyle(badge);
            const matrix = new DOMMatrix(style.transform);
            initialTranslateX = matrix.m41;
            initialTranslateY = matrix.m42;
            badge.style.cursor = 'grabbing';
            anime.remove(badge);
        };
        const onDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = (e.clientX || e.touches[0].clientX) - startX;
            const currentY = (e.clientY || e.touches[0].clientY) - startY;
            const now = Date.now();
            const dt = now - lastTime;
            const clientX = (e.clientX || e.touches[0].clientX);
            const clientY = (e.clientY || e.touches[0].clientY);
            if (dt > 0) {
                vx = (clientX - lastX) / dt;
                vy = (clientY - lastY) / dt;
            }
            lastX = clientX; lastY = clientY; lastTime = now;
            currentTranslateX = initialTranslateX + currentX;
            currentTranslateY = initialTranslateY + currentY;
            badge.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px)`;
        };
        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            badge.style.cursor = 'grab';
            const inertiaFactor = 30;
            const targetX = currentTranslateX + (vx * inertiaFactor);
            const targetY = currentTranslateY + (vy * inertiaFactor);
            anime({
                targets: badge,
                translateX: targetX,
                translateY: targetY,
                duration: 600,
                easing: 'easeOutExpo',
                complete: () => {
                    anime({
                        targets: badge,
                        translateX: 0,
                        translateY: 0,
                        duration: 800,
                        easing: 'spring(1, 60, 15, 0)'
                    });
                }
            });
        };
        badge.addEventListener('mousedown', startDrag);
        badge.addEventListener('touchstart', startDrag);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag);
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    }
    // --- Scroll ---
    let ticking = false;
    const heroTitle = document.querySelector('.hero-title');
    const heroLead = document.querySelector('.hero-section p.lead');
    const navbar = document.querySelector('.floating-navbar');

    // Check inicial da navbar para aplicar transparência se carregar no topo
    if (navbar) {
        if (window.scrollY < 50) navbar.classList.add('navbar-transparent');
        // Garante que a verificação ocorra também após o carregamento total da página
        window.addEventListener('load', () => {
            if (window.scrollY < 50) navbar.classList.add('navbar-transparent');
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Lógica de Transparência da Navbar
                if (navbar) {
                    if (scrollY < 50) {
                        navbar.classList.add('navbar-transparent');
                    } else {
                        navbar.classList.remove('navbar-transparent');
                    }
                }

                if (heroTitle) {
                    heroTitle.style.transform = `translateY(${scrollY * 0.4}px)`;
                }
                if (heroLead) {
                    heroLead.style.transform = `translateY(${scrollY * 0.4}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
    // --- Background Glow ---
    const bgGlow = document.querySelector('.hero-bg-glow');
    if (bgGlow) {
        bgGlow.style.willChange = 'transform';
        bgGlow.style.top = '0';
        bgGlow.style.left = '0';
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        const glowState = { color: 'rgba(112, 0, 255, 0.35)' };
        let currentSection = 'hero';
        bgGlow.style.setProperty('--glow-color', glowState.color);
        let lastCheck = 0;

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;

            // Verifica a mudança de seção apenas a cada 100ms para evitar travamentos
            const now = Date.now();
            if (now - lastCheck > 100) {
                lastCheck = now;
                const isHero = e.target.closest('.hero-section');
                const targetSection = isHero ? 'hero' : 'other';
                if (targetSection !== currentSection) {
                    currentSection = targetSection;
                    const targetColor = isHero ? 'rgba(112, 0, 255, 0.35)' : 'rgba(13, 110, 253, 0.5)';
                    anime.remove(glowState);
                    anime({
                        targets: glowState,
                        color: targetColor,
                        duration: 500,
                        easing: 'linear',
                        update: () => {
                            bgGlow.style.setProperty('--glow-color', glowState.color);
                        }
                    });
                }
            }
        });
        function animateGlow() {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;
            bgGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }
});
// --- Search ---
function initSearch() {
    const $searchInput = $(".search-input");
    const $searchBtn = $(".search-btn");
    const $resultsContainer = $("#search-results");
    if (!$searchInput.length || !$searchBtn.length) return;
    const performSearch = () => {
        const query = $searchInput.val().trim();
        if (!query) return;
        const skeletonHtml = `
            <div class="card border-0 mb-2 bg-dark text-white overflow-hidden" style="border-bottom: 1px solid rgba(255,255,255,0.1) !important;">
                <div class="d-flex align-items-center p-3">
                    <div class="flex-shrink-0 me-3">
                        <div class="skeleton rounded-circle" style="width: 60px; height: 60px;"></div>
                    </div>
                    <div class="flex-grow-1">
                        <div class="skeleton skeleton-text" style="width: 60%;"></div>
                        <div class="skeleton skeleton-text" style="width: 30%;"></div>
                    </div>
                    <div class="ms-3">
                         <div class="skeleton rounded-pill" style="width: 100px; height: 35px;"></div>
                    </div>
                </div>
            </div>
        `;
        $resultsContainer.html(skeletonHtml).show();
        $searchBtn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i>');
        $.ajax({
            url: "/Search/SearchGame",
            method: "GET",
            data: { query: query },
            dataType: "json",
            success: function (data) {
                if (!data || $.isEmptyObject(data)) {
                    $resultsContainer.html('<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>');
                    return;
                }
                const html = `
                    <div class="card border-0 mb-2 bg-dark text-white overflow-hidden hover-bg-light" style="border-bottom: 1px solid rgba(255,255,255,0.1) !important; cursor: pointer;">
                        <div class="d-flex align-items-center p-3">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                    <i class="fas fa-gamepad fa-2x"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <h5 class="mb-1 fw-bold">${data.title}</h5>
                                <div class="badge bg-success bg-opacity-75 fs-6 mt-1">R$ ${data.price}</div>
                            </div>
                            <div class="ms-3">
                                <a href="${data.url}" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3">
                                    Ver Loja <i class="fas fa-external-link-alt ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                $resultsContainer.html(html);
            },
            error: function (xhr, status, error) {
                console.error("Erro na busca:", error);
                $resultsContainer.html('<div class="text-center text-danger p-3">Erro ao buscar jogos. Tente novamente.</div>');
            },
            complete: function () {
                $searchBtn.prop("disabled", false).html('<i class="fas fa-search"></i>');
            }
        });
    };
    $searchBtn.off("click").on("click", performSearch);
    $searchInput.off("keypress").on("keypress", function (e) {
        if (e.which === 13) performSearch();
    });
    $searchInput.on("keydown", function (e) {
        if (e.key === "Escape") $resultsContainer.hide();
    });
}
// --- Features Swiper ---
function initFeaturesSwiper() {
    if (typeof Swiper === 'undefined') return;
    new Swiper('.features-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        autoHeight: true,
        slideToClickedSlide: true,
        speed: 800,
        slidesPerView: 1,
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        coverflowEffect: {
            rotate: 35,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        }
    });
}
// --- Typewriter ---
function initTypewriter() {
    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;
    const phrases = ["menor preço.", "melhor desconto.", "jogo favorito."];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    type();
}

// --- Deals Section (Grid & Filters) ---
function initDeals() {
    const $grid = $("#deals-grid");
    const $filters = $(".filter-pill");

    // 1. Render Skeleton Loading
    const renderSkeleton = () => {
        let html = '';
        for (let i = 0; i < 8; i++) {
            html += `
                <div class="col-lg-3 col-md-6">
                    <div class="card h-100 border-0 bg-dark rounded-4 overflow-hidden shadow-sm" style="border: 1px solid rgba(255,255,255,0.05) !important;">
                        <div class="skeleton-shimmer" style="height: 180px; width: 100%;"></div>
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="skeleton-shimmer rounded-pill" style="width: 60px; height: 20px;"></div>
                                <div class="skeleton-shimmer rounded-pill" style="width: 40px; height: 20px;"></div>
                            </div>
                            <div class="skeleton-shimmer mb-2 rounded" style="width: 80%; height: 24px;"></div>
                            <div class="skeleton-shimmer mb-3 rounded" style="width: 40%; height: 16px;"></div>
                            <div class="d-flex justify-content-between align-items-end mt-3">
                                <div>
                                    <div class="skeleton-shimmer mb-1 rounded" style="width: 50px; height: 14px;"></div>
                                    <div class="skeleton-shimmer rounded" style="width: 80px; height: 28px;"></div>
                                </div>
                                <div class="skeleton-shimmer rounded-circle" style="width: 32px; height: 32px;"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        $grid.html(html);
    };

    // 2. Mock Data (Simulando API)
    const dealsData = [
        { id: 1, title: "Elden Ring", price: "149,90", oldPrice: "229,90", discount: "-35%", platform: "pc", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg" },
        { id: 2, title: "God of War Ragnarök", price: "199,50", oldPrice: "349,90", discount: "-43%", platform: "playstation", store: "PS Store", image: "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png" },
        { id: 3, title: "Cyberpunk 2077", price: "99,90", oldPrice: "199,90", discount: "-50%", platform: "xbox", store: "Xbox", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg" },
        { id: 4, title: "Hollow Knight", price: "14,99", oldPrice: "46,99", discount: "-68%", platform: "pc", store: "GOG", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg" },
        { id: 5, title: "Red Dead Redemption 2", price: "89,90", oldPrice: "299,90", discount: "-70%", platform: "pc", store: "Epic", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg" },
        { id: 6, title: "The Witcher 3", price: "19,99", oldPrice: "99,99", discount: "-80%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg" },
        { id: 7, title: "Zelda: Breath of the Wild", price: "199,00", oldPrice: "299,00", discount: "-33%", platform: "nintendo", store: "Nintendo", image: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000025/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a77cf438e3661" },
        { id: 8, title: "Stardew Valley", price: "12,49", oldPrice: "24,99", discount: "-50%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg" }
    ];

    // 3. Render Cards
    const renderCards = (filter = "all") => {
        const filteredData = filter === "all"
            ? dealsData
            : dealsData.filter(d => d.platform === filter || (filter === "under20" && parseFloat(d.price.replace(',', '.')) < 20));

        if (filteredData.length === 0) {
            $grid.html('<div class="col-12 text-center py-5 text-muted">Nenhuma oferta encontrada para este filtro.</div>');
            return;
        }

        let html = '';
        filteredData.forEach(game => {
            let platformIcon = 'fa-gamepad';
            if (game.platform === 'pc' || game.platform === 'under20') platformIcon = 'fa-desktop';
            if (game.platform === 'playstation') platformIcon = 'fa-playstation';
            if (game.platform === 'xbox') platformIcon = 'fa-xbox';
            if (game.platform === 'nintendo') platformIcon = 'fa-gamepad';

            html += `
                <div class="col-lg-3 col-md-6 fade-in-up">
                    <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-danger fw-bold shadow-sm">${game.discount}</span>
                        </div>
                        <img src="${game.image}" class="card-img-top" alt="${game.title}">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-white-50"><i class="fab ${platformIcon} me-1"></i> ${game.store}</small>
                                <small class="text-decoration-line-through text-muted">R$ ${game.oldPrice}</small>
                            </div>
                            <h5 class="card-title fw-bold mb-auto text-white">${game.title}</h5>
                            <div class="d-flex justify-content-between align-items-end mt-3 border-top border-secondary border-opacity-25 pt-3">
                                <div>
                                    <small class="d-block text-success mb-0" style="font-size: 0.8rem;">Melhor Preço</small>
                                    <span class="h4 fw-bold text-white mb-0">R$ ${game.price}</span>
                                </div>
                                <button class="btn btn-sm btn-primary rounded-circle" style="width: 38px; height: 38px;">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $grid.hide().html(html).fadeIn(400);
    };

    // Inicialização
    renderSkeleton();

    // Simula delay de rede (2 segundos)
    setTimeout(() => {
        renderCards();
    }, 2000);

    // 4. Filter Logic
    $filters.on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) return;

        $filters.removeClass('active');
        $this.addClass('active');

        const filter = $this.data('filter');

        // Efeito visual simples de "recarregamento"
        $grid.animate({ opacity: 0 }, 200, function () {
            renderCards(filter);
            $(this).animate({ opacity: 1 }, 200);
        });
    });
}