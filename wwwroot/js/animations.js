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
        }, '-=800');

    return heroTimeline;
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.gs-reveal');
    if (!revealElements.length) return;

    requestAnimationFrame(() => {
        revealElements.forEach(el => {
            el.classList.add('gs-reveal-initial');
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.remove('gs-reveal-initial');
                    entry.target.classList.add('gs-reveal-visible');
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

    bgGlow.classList.add('bg-glow-optimized');

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