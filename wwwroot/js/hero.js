function initParticles() {
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                observer.disconnect();
                loadParticles();
            }
        });
    }, { rootMargin: '50px' });

    const targetElement = particlesContainer.closest('.hero-section') || particlesContainer;
    observer.observe(targetElement);
}

function loadParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 30, "density": { "enable": false } },
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
                    "speed": 1.0,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": false }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": false },
                    "onclick": { "enable": false },
                    "resize": true
                }
            },
            "retina_detect": false
        });
    }
}

(function() {
    'use strict';

    let resizeTimer;

    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.pJSDom && window.pJSDom.length > 0) {
                window.pJSDom[0].pJS.fn.vendors.destroypJS();
                window.pJSDom = [];
            }
            initParticles();
        }, 250);
    }

    function init() {
        initParticles();
        window.addEventListener('resize', handleResize);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();