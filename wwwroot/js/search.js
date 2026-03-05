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
            <div class="search-item-card text-white overflow-hidden">
                <div class="d-flex align-items-center p-2">
                    <div class="flex-shrink-0 me-2">
                        <div class="skeleton search-item-thumb-small"></div>
                    </div>
                    <div class="flex-grow-1">
                        <div class="skeleton skeleton-text search-item-title-small"></div>
                        <div class="skeleton skeleton-text search-item-price-small"></div>
                    </div>
                    <div class="ms-2">
                        <div class="skeleton search-item-button-small"></div>
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
            <div class="search-item-card text-white overflow-hidden">
                <div class="d-flex align-items-center p-2">
                    <div class="flex-shrink-0 me-2">
                        <div class="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary search-item-thumb-small">
                            <i class="fas fa-gamepad fa-lg"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold small">${safeTitle}</h6>
                        <div class="badge bg-success bg-opacity-75 small">R$ ${safePrice}</div>
                    </div>
                    <div class="ms-2">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
                           class="btn btn-sm btn-outline-light rounded-pill px-2 py-1 search-item-button-small d-flex align-items-center justify-content-center small">
                            Ver <i class="bi bi-box-arrow-up-right ms-1 search-result-icon"></i>
                        </a>
                    </div>
                </div>
            </div>
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