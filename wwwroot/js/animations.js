// Visual Effects & Animations

function initHeroAnimations() {
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

    return heroTimeline;
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.gs-reveal');
    if (!revealElements.length) return;

    requestAnimationFrame(() => {
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px) scale(0.9)';
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    entry.target.style.opacity = '1';
                });

                const counters = entry.target.querySelectorAll('.counter');
                if (counters.length && typeof anime === 'function') {
                    counters.forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        if (isNaN(target)) return;

                        const count = { val: 0 };
                        anime({
                            targets: count,
                            val: [0, target],
                            round: 1,
                            easing: 'easeOutExpo',
                            duration: 5000,
                            update: () => {
                                counter.textContent = count.val;
                            }
                        });
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
}

function initBadgeInteractivity() {
    const badge = document.querySelector('.hero-section .badge');
    if (!badge || typeof anime !== 'function') return;

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
        startX = e.clientX || e.touches?.[0]?.clientX;
        startY = e.clientY || e.touches?.[0]?.clientY;
        lastX = startX;
        lastY = startY;
        lastTime = Date.now();

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

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        const currentX = clientX - startX;
        const currentY = clientY - startY;
        const now = Date.now();
        const dt = now - lastTime;

        if (dt > 0) {
            vx = (clientX - lastX) / dt;
            vy = (clientY - lastY) / dt;
        }

        lastX = clientX;
        lastY = clientY;
        lastTime = now;
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
    badge.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}

function initScrollEffects() {
    let ticking = false;
    const heroTitle = document.querySelector('.hero-title');
    const heroLead = document.querySelector('.hero-section p.lead');

    if (!heroTitle && !heroLead) return;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
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
    }, { passive: true });
}

function initBackgroundGlow() {
    const bgGlow = document.querySelector('.hero-bg-glow');
    if (!bgGlow || typeof anime !== 'function') return;

    bgGlow.style.willChange = 'transform';
    bgGlow.style.top = '0';
    bgGlow.style.left = '0';

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const glowState = { color: 'rgba(112, 0, 255, 0.35)' };
    let currentSection = 'hero';
    let lastCheck = 0;
    let isAnimating = false;

    bgGlow.style.setProperty('--glow-color', glowState.color);

    function animateGlow() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        bgGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

        if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
            requestAnimationFrame(animateGlow);
        } else {
            isAnimating = false;
        }
    }

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animateGlow);
        }

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

    isAnimating = true;
    animateGlow();
}