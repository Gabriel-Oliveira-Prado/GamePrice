// JS Logic for the new sections (Free Games & Contributors)

$(document).ready(function () {
    // Free Games Skeleton Loading
    const freeGamesGrid = document.getElementById("free-games-grid");
    if (freeGamesGrid) {
        const originalContent = freeGamesGrid.innerHTML;
        let skeletonHtml = '';
        for (let i = 0; i < 4; i++) {
            skeletonHtml += `
            <div class="col-md-4 col-lg-3">
                <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect" style="border: 1px solid rgba(255,255,255,0.05) !important;">
                    <div class="skeleton-shimmer" style="height: 180px; width: 100%;"></div>
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-3 mt-1">
                            <div class="skeleton-shimmer rounded-pill" style="width: 80px; height: 16px;"></div>
                        </div>
                        <div class="skeleton-shimmer mb-3 mt-1 rounded" style="width: 90%; height: 24px;"></div>
                        <div class="d-flex justify-content-between align-items-end mt-auto border-top border-secondary border-opacity-25 pt-3">
                            <div>
                                <div class="skeleton-shimmer rounded mb-1" style="width: 60px; height: 12px;"></div>
                                <div class="skeleton-shimmer rounded" style="width: 50px; height: 24px;"></div>
                            </div>
                            <div class="skeleton-shimmer rounded-pill" style="width: 90px; height: 32px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        freeGamesGrid.innerHTML = skeletonHtml;
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
                <div class="contributor-card text-center h-100 position-relative overflow-hidden" style="border: 1px solid rgba(255,255,255,0.05) !important;">
                    <div class="position-absolute top-0 start-0 w-100" style="height: 60px; background: rgba(255,255,255,0.03);"></div>
                    <div class="skeleton-shimmer rounded-circle mx-auto position-relative z-1 mt-2" style="width: 96px; height: 96px; border: 2px solid rgba(255,255,255,0.1);"></div>
                    <div class="skeleton-shimmer rounded mx-auto mt-4 mb-2" style="width: 140px; height: 24px;"></div>
                    <div class="skeleton-shimmer rounded mx-auto mb-4" style="width: 110px; height: 16px;"></div>
                    <div class="skeleton-shimmer rounded-pill mx-auto" style="width: 130px; height: 38px;"></div>
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
        // Prepare initial state
        fgTitle.style.opacity = '0';
        fgText.style.opacity = '0';
        
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
