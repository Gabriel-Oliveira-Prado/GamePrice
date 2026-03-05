// JS Logic for the new sections (Free Games & Contributors)

$(document).ready(function () {
    // Free Games Skeleton Loading
    const freeGamesGrid = document.getElementById("free-games-grid");
    if (freeGamesGrid) {
        const originalContent = freeGamesGrid.innerHTML;

        if (typeof renderGameCardsSkeletonGrid === 'function') {
            freeGamesGrid.innerHTML = renderGameCardsSkeletonGrid(4, "col-md-4 col-lg-3", { showDiscount: false, showOldPrice: false });
        } else {
            console.warn('Skeleton component not loaded');
        }

        setTimeout(() => {
            freeGamesGrid.innerHTML = originalContent;
            $(freeGamesGrid).hide().fadeIn(500);
        }, 2200);
    }

    // Contributors Skeleton Loading
    const contributorsGrid = document.getElementById("contributors-grid");
    if (contributorsGrid) {
        const originalContent = contributorsGrid.innerHTML;
        let skeletonHtml = '';
        for (let i = 0; i < 2; i++) {
            skeletonHtml += `
            <div class="col-md-5 col-lg-4">
                <div class="contributor-card text-center h-100 position-relative overflow-hidden skeleton-border">
                    <div class="position-absolute top-0 start-0 w-100 skeleton-contributor-header"></div>
                    <div class="skeleton-shimmer rounded-circle mx-auto position-relative z-1 mt-2 skeleton-avatar"></div>
                    <div class="skeleton-shimmer rounded mx-auto mt-4 mb-2 skeleton-contributor-name"></div>
                    <div class="skeleton-shimmer rounded mx-auto mb-4 skeleton-contributor-role"></div>
                    <div class="skeleton-shimmer rounded-pill mx-auto skeleton-contributor-button"></div>
                </div>
            </div>`;
        }
        contributorsGrid.innerHTML = skeletonHtml;
        setTimeout(() => {
            contributorsGrid.innerHTML = originalContent;
            $(contributorsGrid).hide().fadeIn(500);
        }, 2600);
    }

    // Advanced Animation for Free Games Header
    const fgTitle = document.querySelector("#free-games h2");
    const fgText = document.querySelector("#free-games p.text-white-50");
    const fgContainer = document.querySelector("#free-games .p-md-5");

    if (fgTitle && fgText && fgContainer) {
        // Prepare initial state with CSS classes instead of inline styles
        fgTitle.classList.add('initial-opacity-0');
        fgText.classList.add('initial-opacity-0');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: [fgTitle, fgText],
                        translateY: [30, 0],
                        opacity: [0, 1],
                        duration: 1000,
                        delay: anime.stagger(150),
                        easing: 'easeOutElastic(1, .8)'
                    });

                    // Add a subtle border glow pulse wrapper to the container itself
                    anime({
                        targets: fgContainer,
                        boxShadow: [
                            '0 16px 40px rgba(0,0,0,0.5), inset 0 0 0px rgba(13, 110, 253, 0)',
                            '0 16px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(13, 110, 253, 0.3)',
                            '0 16px 40px rgba(0,0,0,0.5), inset 0 0 0px rgba(13, 110, 253, 0)'
                        ],
                        duration: 2000,
                        easing: 'easeInOutSine'
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        observer.observe(fgContainer);
    }
});
