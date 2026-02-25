//Typewriter
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

//Particles Initialization
function initParticles() {
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 55, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#0d6efd", "#00e5ff", "#10b981"] }, // Azul primario, Ciano da interface, Verde (Dinheiro/Desconto)
                "shape": {
                    "type": ["circle", "char"],
                    "stroke": { "width": 0, "color": "#000000" },
                    "character": {
                        "value": ["%"], // % simboliza as promoções
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
                    "value": 4, // Tamanho sutil mas legível
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 1, "sync": false }
                },
                "line_linked": {
                    "enable": true, // Mantém a "Rede de Busca" (O Bot)
                    "distance": 160,
                    "color": "#0d6efd",
                    "opacity": 0.25,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.2, // Um pouco mais de fluidez
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 } // Cria agrupamentos de rede parecendo bancos de dados
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

// Ensure particles are loaded when document is ready
document.addEventListener('DOMContentLoaded', function () {
    initParticles();
});