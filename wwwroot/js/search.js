function initSearch() {
    const $searchInput = $(".search-input");
    const $searchBtn = $(".search-btn");
    const $resultsContainer = $("#search-results");

    if (!$searchInput.length || !$searchBtn.length || !$resultsContainer.length) return;

    const escapeHTML = (str) => {
        return $('<div>').text(str || '').html();
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
        `;
    };

    const renderResult = (data) => {
        if (!data) {
            return '<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>';
        }

        const safeTitle = escapeHTML(data.title);
        const safePrice = escapeHTML(String(data.price));
        const safeUrl = escapeHTML(data.url);

        return `
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="search-item-card text-white text-decoration-none overflow-hidden d-block">
                <div class="d-flex align-items-stretch">
                    <div class="flex-shrink-0">
                        <div class="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary h-100 m-0 search-item-thumb-small" style="border-radius: 0; min-height: 60px;">
                            <i class="fas fa-gamepad fa-lg"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 py-3 px-3 d-flex flex-column justify-content-center">
                        <h6 class="mb-1 fw-bold text-truncate">${safeTitle}</h6>
                        <div class="badge bg-success bg-opacity-75 small align-self-start">R$ ${safePrice}</div>
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

        $resultsContainer.html(renderSkeleton()).show();
        $searchBtn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: "/Search/SearchGame",
            method: "GET",
            data: { query },
            dataType: "json",
            timeout: 10000,
            success: (data) => {
                const html = (!data || $.isEmptyObject(data)) 
                    ? '<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>'
                    : renderResult(data);
                $resultsContainer.html(html);
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
            $resultsContainer.hide();
        }
    });

    return () => {
        $searchBtn.off("click");
        $searchInput.off("keypress keydown");
    };
}