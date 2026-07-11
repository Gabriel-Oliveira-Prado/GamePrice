function initSearch() {
    const $searchInput = $(".search-input");
    const $searchBtn = $(".search-btn");
    const $resultsContainer = $("#search-results");

    if (!$searchInput.length || !$searchBtn.length || !$resultsContainer.length) return;

    const escapeHTML = (str) => {
        return $('<div>').text(str || '').html();
    };

    const getStoreIcon = (store) => {
        const s = (store || '').toLowerCase();
        if (s.includes('steam')) return 'fab fa-steam';
        if (s.includes('epic')) return 'fab fa-epic-games';
        if (s.includes('playstation') || s.includes('ps')) return 'fab fa-playstation';
        if (s.includes('xbox')) return 'fab fa-xbox';
        if (s.includes('nintendo')) return 'bi bi-nintendo-switch';
        if (s.includes('gog')) return 'fas fa-compact-disc';
        if (s.includes('nuuvem')) return 'fas fa-cloud';
        return 'fas fa-store';
    };

    const renderSkeleton = () => {
        return `
            <div class="search-item-card text-white overflow-hidden d-block">
                <div class="d-flex align-items-stretch">
                    <div class="flex-shrink-0">
                        <div class="skeleton skeleton-shimmer search-item-thumb-small m-0 rounded-0" style="min-height: 100%; border-top-left-radius: var(--radius-lg); border-bottom-left-radius: var(--radius-lg);"></div>
                    </div>
                    <div class="flex-grow-1 py-3 px-3">
                        <div class="skeleton skeleton-shimmer skeleton-text search-item-title-small mb-2 mt-1"></div>
                        <div class="skeleton skeleton-shimmer search-item-price-small mb-1"></div>
                    </div>
                    <div class="flex-shrink-0 d-flex align-items-center pe-3">
                        <div class="skeleton skeleton-shimmer search-item-button-small"></div>
                    </div>
                </div>
            </div>
            <div class="text-center text-white-50 small py-2">
                <i class="fas fa-spinner fa-spin me-1"></i> Buscando em todas as lojas...
            </div>
        `;
    };

    const renderResult = (dataList) => {
        if (!dataList || dataList.length === 0) {
            return '<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>';
        }

        const cheapest = dataList[0];
        const safeTitle = escapeHTML(cheapest.nome);
        const safePrice = escapeHTML(String(cheapest.preco_atual || 'Indisponível'));
        const safeStore = escapeHTML(cheapest.plataforma);
        const safeImage = escapeHTML(cheapest.imagem);
        const storeIcon = getStoreIcon(cheapest.plataforma);
        const hasImage = cheapest.imagem && cheapest.imagem.length > 0;

        return `
            <a href="/Search/Details?gameName=${encodeURIComponent(cheapest.nome)}" class="search-item-card text-white text-decoration-none overflow-hidden d-block">
                <div class="d-flex align-items-stretch">
                    <div class="flex-shrink-0">
                        ${hasImage
                            ? `<img src="${safeImage}" alt="${safeTitle}" class="search-item-thumb-small m-0 rounded-0" style="object-fit: cover; min-height: 100%; border-top-left-radius: var(--radius-lg); border-bottom-left-radius: var(--radius-lg);">`
                            : `<div class="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary h-100 m-0 search-item-thumb-small" style="border-radius: 0; min-height: 60px;">
                                <i class="fas fa-gamepad fa-lg"></i>
                              </div>`
                        }
                    </div>
                    <div class="flex-grow-1 py-3 px-3 d-flex flex-column justify-content-center">
                        <h6 class="mb-1 fw-bold text-truncate">${safeTitle}</h6>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-success bg-opacity-75 small">${safePrice}</span>
                            <small class="text-white-50"><i class="${storeIcon} me-1"></i>${safeStore}</small>
                        </div>
                    </div>
                    <div class="flex-shrink-0 d-flex align-items-center pe-3">
                        <span class="btn btn-sm text-white search-item-button-small border-0 shadow-none search-btn-view transition-base d-flex align-items-center justify-content-center" style="background: transparent;">
                            Ver <i class="bi bi-box-arrow-up-right ms-1 search-result-icon"></i>
                        </span>
                    </div>
                </div>
            </a>
        `;
    };

    const performSearch = () => {
        const query = $searchInput.val().trim();
        if (!query) return;

        $resultsContainer.html(renderSkeleton()).slideDown(300);
        $searchBtn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: "/Search/SearchGame",
            method: "GET",
            data: { query },
            dataType: "json",
            timeout: 120000,
            success: (data) => {
                if (!data || data.length === 0) {
                    $resultsContainer.html('<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>');
                } else {
                    const html = renderResult(data);
                    $resultsContainer.html(html);
                }
            },
            error: (xhr, status, error) => {
                console.error("Erro na busca:", error);
                const errorMsg = status === 'timeout' 
                    ? 'Tempo esgotado. Tente novamente.'
                    : 'Erro ao buscar jogos. Tente novamente.';
                $resultsContainer.html(`<div class="text-center text-danger p-3">${errorMsg}</div>`);
            },
            complete: () => {
                $searchBtn.prop("disabled", false).html('<i class="fas fa-search"></i>');
            }
        });
    };

    $searchBtn.off("click").on("click", performSearch);

    $searchInput.off("keypress").on("keypress", (e) => {
        if (e.which === 13) {
            e.preventDefault();
            performSearch();
        }
    });

    $searchInput.off("keydown").on("keydown", (e) => {
        if (e.key === "Escape") {
            $resultsContainer.slideUp(300);
        }
    });

    return () => {
        $searchBtn.off("click");
        $searchInput.off("keypress keydown");
    };
}