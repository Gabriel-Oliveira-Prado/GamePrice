// Skeleton Loader Component - Componente reutilizável para loading states

/**
 * Gera HTML de skeleton para card de jogo
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.showDiscount - Mostrar badge de desconto
 * @param {boolean} options.showOldPrice - Mostrar preço antigo
 * @returns {string} HTML do skeleton
 */
function generateGameCardSkeleton(options = {}) {
    const { showDiscount = true, showOldPrice = true } = options;

    return `
        <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect skeleton-border">
            ${showDiscount ? '<div class="position-absolute top-0 end-0 m-2"><div class="skeleton-shimmer skeleton-discount-badge"></div></div>' : ''}
            <div class="skeleton-shimmer card-img-top"></div>
            <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="skeleton-shimmer rounded-pill skeleton-store"></div>
                    ${showOldPrice ? '<div class="skeleton-shimmer rounded skeleton-old-price"></div>' : ''}
                </div>
                <div class="skeleton-shimmer mb-3 rounded skeleton-title"></div>
                <div class="mt-auto pt-3 border-top border-secondary">
                    <div class="text-center">
                        <div class="skeleton-shimmer mb-2 rounded mx-auto skeleton-label"></div>
                        <div class="skeleton-shimmer rounded mx-auto skeleton-price"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza múltiplos cards skeleton em um grid
 * @param {number} count - Número de cards
 * @param {string} columnClass - Classes das colunas (ex: "col-lg-3 col-md-6")
 * @param {Object} options - Opções passadas para generateGameCardSkeleton
 * @returns {string} HTML do grid com skeletons
 */
function renderGameCardsSkeletonGrid(count = 4, columnClass = "col-lg-3 col-md-6", options = {}) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="${columnClass}">
                ${generateGameCardSkeleton(options)}
            </div>
        `;
    }
    return html;
}

// Exportar para uso global
window.generateGameCardSkeleton = generateGameCardSkeleton;
window.renderGameCardsSkeletonGrid = renderGameCardsSkeletonGrid;
