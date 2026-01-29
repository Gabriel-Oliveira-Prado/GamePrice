﻿﻿﻿document.addEventListener('DOMContentLoaded', () => {
    // Bloqueia o scroll durante o carregamento
    document.body.style.overflow = 'hidden';

    // --- Animação do Preloader com Anime.js ---
    const loaderTimeline = anime.timeline({
        easing: 'easeInOutQuad',
        complete: () => {
            // Libera o scroll e inicia as animações da página
            document.body.style.overflow = '';
            heroTimeline.play();
            initScrollReveal();
            initSearch(); // Initialize search functionality
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
            fill: '#0d6efd', // Cor text-primary do Bootstrap (Azul)
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

    // --- Animação Hero (Entrada inicial) ---
    const heroTimeline = anime.timeline({
        autoplay: false, // Aguarda o loader terminar
        easing: 'easeOutExpo'
    });

    heroTimeline.add({
        targets: [".hero-title", ".hero-section p.lead"], // Alvos sincronizados
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: anime.stagger(100), // Leve atraso entre eles para fluidez
        easing: 'easeOutElastic(1, .6)' // Efeito elástico bem animado
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

    // --- Scroll Reveal (Substituindo ScrollTrigger) ---
    const revealElements = document.querySelectorAll('.gs-reveal');

    // Configuração inicial dos elementos
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
                        duration: 1200,
                        easing: 'easeOutElastic(1, .6)'
                    });

                    // Animação de Contadores (se houver dentro do elemento revelado)
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const count = { val: 0 };

                        anime({
                            targets: count,
                            val: [0, target],
                            round: 1, // Arredonda para números inteiros
                            easing: 'easeOutExpo',
                            duration: 5000,
                            update: function () {
                                counter.innerHTML = count.val;
                            }
                        });
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    };

    // --- Draggable & Animatable (Badge Interativo) ---
    const badge = document.querySelector('.hero-section .badge');
    if (badge) {
        badge.style.cursor = 'grab';
        badge.style.userSelect = 'none';

        let isDragging = false;
        let startX, startY;
        let initialTranslateX = 0;
        let initialTranslateY = 0;

        const startDrag = (e) => {
            isDragging = true;
            startX = (e.clientX || e.touches[0].clientX);
            startY = (e.clientY || e.touches[0].clientY);

            // Obtém a posição atual da transformação para evitar reset/pulo
            const style = window.getComputedStyle(badge);
            const matrix = new DOMMatrix(style.transform);
            initialTranslateX = matrix.m41;
            initialTranslateY = matrix.m42;

            badge.style.cursor = 'grabbing';
            anime.remove(badge); // Para animações anteriores
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Evita scroll em touch devices
            const currentX = (e.clientX || e.touches[0].clientX) - startX;
            const currentY = (e.clientY || e.touches[0].clientY) - startY;

            // Move o elemento diretamente para performance
            // Soma o delta do movimento atual com a posição inicial capturada
            badge.style.transform = `translate(${initialTranslateX + currentX}px, ${initialTranslateY + currentY}px)`;
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            badge.style.cursor = 'grab';

            // Efeito de mola (Spring) para voltar ao lugar
            anime({
                targets: badge,
                translateX: 0,
                translateY: 0,
                duration: 800,
                easing: 'spring(1, 80, 10, 0)'
            });
        };

        badge.addEventListener('mousedown', startDrag);
        badge.addEventListener('touchstart', startDrag);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag);
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    }

    // --- Eventos de Scroll (Parallax e Navbar) ---
    window.onscroll = () => {
        const scrollY = window.scrollY;

        // Parallax no título
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            anime.set(heroTitle, { translateY: scrollY * 0.4 });
        }
        const heroLead = document.querySelector('.hero-section p.lead');
        if (heroLead) {
            anime.set(heroLead, { translateY: scrollY * 0.4 });
        }
    };

    // --- Background Interativo (Seguir Mouse) ---
    const bgGlow = document.querySelector('.hero-bg-glow');

    if (bgGlow) {
        // Configuração inicial
        anime.set(bgGlow, { translateX: '-50%', translateY: '-50%' });

        // Estado da cor para animação
        const glowState = { color: 'rgba(112, 0, 255, 0.15)' };
        let currentSection = 'hero';

        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Movimento mais rápido (600ms)
            anime({
                targets: bgGlow,
                left: mouseX,
                top: mouseY,
                duration: 600,
                easing: 'easeOutExpo'
            });

            // Detecção de seção para troca de cor
            const isHero = e.target.closest('.hero-section');
            const targetSection = isHero ? 'hero' : 'other';

            if (targetSection !== currentSection) {
                currentSection = targetSection;
                const targetColor = isHero ? 'rgba(112, 0, 255, 0.15)' : 'rgba(0, 229, 255, 0.15)'; // Roxo vs Ciano

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
        });
    }
});

// --- Search Functionality ---
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const resultsContainer = document.getElementById('search-results');

    if (!searchInput || !searchBtn) return;

    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        // UI Loading State
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div class="text-center text-white p-3">Buscando melhores preços...</div>';

        try {
            // Call MVC Backend -> which calls API -> which calls Scraper
            const response = await fetch(`/Search/SearchGame?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            renderResults(data);
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<div class="text-center text-danger p-3">Erro ao buscar jogos. Tente novamente.</div>';
        } finally {
            searchBtn.innerHTML = '<i class="fas fa-search"></i>';
            searchBtn.disabled = false;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    function renderResults(games) {
        if (!games || games.length === 0) {
            resultsContainer.innerHTML = '<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>';
            return;
        }

        let html = '<div class="list-group">';
        games.forEach(game => {
            html += `
                <a href="${game.link}" target="_blank" class="list-group-item list-group-item-action d-flex align-items-center bg-dark text-white border-secondary mb-2 rounded">
                    <img src="${game.image}" alt="${game.title}" class="rounded me-3" style="width: 80px; height: 45px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0 fw-bold">${game.title}</h6>
                        <small class="text-muted"><i class="fab fa-steam"></i> ${game.store}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary rounded-pill fs-6">${game.price}</span>
                    </div>
                </a>
            `;
        });
        html += '</div>';
        
        resultsContainer.innerHTML = html;
    }
}