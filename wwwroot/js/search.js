function initSearch() {
    const $searchInput = $(".search-input");
    const $searchBtn = $(".search-btn");
    const $resultsContainer = $("#search-results");
    if (!$searchInput.length || !$searchBtn.length) return;
    const performSearch = () => {
        const query = $searchInput.val().trim();
        if (!query) return;
        const skeletonHtml = `
            <div class="card border-0 mb-3 bg-dark text-white overflow-hidden search-item-card">
                <div class="d-flex align-items-center p-3">

                    <div class="flex-shrink-0 me-3">
                        <div class="skeleton search-item-thumb"></div>
                    </div>

                    <div class="flex-grow-1">
                        <div class="skeleton skeleton-text search-item-title"></div>
                        <div class="skeleton skeleton-text search-item-price"></div>
                    </div>

                    <div class="ms-3">
                        <div class="skeleton search-item-button"></div>
                    </div>

                </div>
            </div>
        `;

        $resultsContainer.html(skeletonHtml).show();
        $searchBtn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i>');
        $.ajax({
            url: "/Search/SearchGame",
            method: "GET",
            data: { query: query },
            dataType: "json",
            success: function (data) {
                if (!data || $.isEmptyObject(data)) {
                    $resultsContainer.html('<div class="text-center text-muted p-3">Nenhum jogo encontrado.</div>');
                    return;
                }
                const html = `
                    <div class="card border-0 mb-2 bg-dark text-white overflow-hidden search-item-card" style="cursor: pointer;">
                        <div class="d-flex align-items-center p-3">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary search-item-thumb">
                                    <i class="fas fa-gamepad fa-2x"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <h5 class="mb-1 fw-bold">${data.title}</h5>
                                <div class="badge bg-success bg-opacity-75 fs-6 mt-1">R$ ${data.price}</div>
                            </div>
                            <div class="ms-3">
                                <a href="${data.url}" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3 search-item-button d-flex align-items-center justify-content-center">
                                    Ver <i class="fas fa-external-link-alt ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                $resultsContainer.html(html);
            },
            error: function (xhr, status, error) {
                console.error("Erro na busca:", error);
                $resultsContainer.html('<div class="text-center text-danger p-3">Erro ao buscar jogos. Tente novamente.</div>');
            },
            complete: function () {
                $searchBtn.prop("disabled", false).html('<i class="fas fa-search"></i>');
            }
        });
    };
    $searchBtn.off("click").on("click", performSearch);
    $searchInput.off("keypress").on("keypress", function (e) {
        if (e.which === 13) performSearch();
    });
    $searchInput.on("keydown", function (e) {
        if (e.key === "Escape") $resultsContainer.hide();
    });
}