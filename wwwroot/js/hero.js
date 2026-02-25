//Particles Initialization
function initParticles() {
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 75, "density": { "enable": false } },
                "color": { "value": ["#0d6efd", "#00e5ff", "#10b981"] },
                "shape": {
                    "type": ["circle", "char"],
                    "stroke": { "width": 0, "color": "#000000" },
                    "character": {
                        "value": ["%"],
                        "font": "Inter",
                        "style": "normal",
                        "weight": "bold"
                    }
                },
                "opacity": {
                    "value": 0.4,
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false }
                },
                "size": {
                    "value": 4,
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 1, "sync": false }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 160,
                    "color": "#0d6efd",
                    "opacity": 0.25,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } },
                    "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
                    "repulse": { "distance": 200, "duration": 0.4 },
                    "push": { "particles_nb": 4 },
                    "remove": { "particles_nb": 2 }
                }
            },
            "retina_detect": true
        });
    }
}
function initGravityBadge() {
    const badge = document.getElementById('hero-gravity-badge');
    if (!badge) return;

    badge.style.cursor = 'grab';
    badge.style.userSelect = 'none';
    badge.style.touchAction = 'none';

    let isDragging = false;
    let currentX = 0, currentY = 0;
    let velocityX = 0, velocityY = 0;
    let lastMouseX = 0, lastMouseY = 0;
    let lastTime = 0;
    let animationFrame;
    let snapBackTimer;

    const gravity = 0.6;
    const bounceFactor = 0.6;
    const friction = 0.98;

    function startDrag(e) {
        if (e.type === 'touchstart') e.preventDefault();
        isDragging = true;
        cancelAnimationFrame(animationFrame);
        clearTimeout(snapBackTimer);

        badge.style.cursor = 'grabbing';
        badge.style.transition = 'none';

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        lastMouseX = clientX;
        lastMouseY = clientY;
        lastTime = performance.now();

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
    }

    function moveDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - lastMouseX;
        const deltaY = clientY - lastMouseY;

        currentX += deltaX;
        currentY += deltaY;

        const now = performance.now();
        const dt = Math.max(now - lastTime, 1);

        velocityX = (deltaX / dt) * 16;
        velocityY = (deltaY / dt) * 16;

        lastMouseX = clientX;
        lastMouseY = clientY;
        lastTime = now;

        updateTransform();
    }

    function endDrag() {
        isDragging = false;
        badge.style.cursor = 'grab';

        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);

        animationFrame = requestAnimationFrame(physicsLoop);

        snapBackTimer = setTimeout(snapBack, 5000);
    }

    function updateTransform() {
        badge.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    function physicsLoop() {
        if (isDragging) return;

        velocityY += gravity; // Aplica gravidade

        velocityX *= friction;
        velocityY *= friction;

        // Calcula limites ANTES de somar a nova velocidade, pois o getBoundingClientRect reflete o frame atual (currentX antigo)
        const rect = badge.getBoundingClientRect();
        const minX = currentX - rect.left;
        const maxX = currentX + (window.innerWidth - rect.right);
        const minY = currentY - rect.top;
        const maxY = currentY + (window.innerHeight - rect.bottom);

        // Nova Posição
        currentX += velocityX;
        currentY += velocityY;

        // Colisões com as bordas da tela (Viewport)
        if (currentX < minX) {
            currentX = minX;
            velocityX = Math.abs(velocityX) * bounceFactor;
        } else if (currentX > maxX) {
            currentX = maxX;
            velocityX = -Math.abs(velocityX) * bounceFactor;
        }

        if (currentY < minY) {
            currentY = minY;
            velocityY = Math.abs(velocityY) * bounceFactor;
        } else if (currentY > maxY) {
            currentY = maxY;
            velocityY = -Math.abs(velocityY) * bounceFactor;

            // Corrige tremor eterno no chão cortando pequenos pulos
            if (Math.abs(velocityY) < gravity * 2.5) {
                velocityY = 0;
            }
        }

        updateTransform();

        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1 || currentY < maxY) {
            animationFrame = requestAnimationFrame(physicsLoop);
        }
    }

    function snapBack() {
        if (isDragging) return;
        cancelAnimationFrame(animationFrame);
        currentX = 0;
        currentY = 0;
        velocityX = 0;
        velocityY = 0;

        badge.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        updateTransform();

        setTimeout(() => {
            if (!isDragging) badge.style.transition = 'none';
        }, 800);
    }

    badge.addEventListener('mousedown', startDrag);
    badge.addEventListener('touchstart', startDrag, { passive: false });
}

document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initGravityBadge();

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.pJSDom && window.pJSDom.length > 0) {
                window.pJSDom[0].pJS.fn.vendors.destroypJS();
                window.pJSDom = [];
            }
            initParticles();
        }, 250);
    });
});