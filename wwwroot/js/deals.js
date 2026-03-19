function initDeals() {
    const $grid = $("#deals-grid");
    const $filters = $(".filter-pill");

    const renderSkeleton = () => {
        if (typeof renderGameCardsSkeletonGrid === 'function') {
            $grid.html(renderGameCardsSkeletonGrid(8, "col-lg-3 col-md-6", { showDiscount: true, showOldPrice: true }));
        } else {
            console.warn('Skeleton component not loaded');
        }
    };
    let dealsData = [];

    const loadDeals = () => {
        renderSkeleton();
        $.ajax({
            url: "/Search/GetDeals",
            method: "GET",
            dataType: "json",
            success: function (data) {
                if (data && data.length > 0) {
                    dealsData = data;
                    renderCards();
                } else {
                    $grid.html('<div class="col-12 text-center py-5 text-muted">Nenhuma oferta em destaque no momento.</div>');
                }
            },
            error: function (xhr, status, error) {
                console.error("Erro ao carregar ofertas:", error);
                // Fallback to empty if the API is offline
                $grid.html('<div class="col-12 text-center py-5 text-danger">Falha ao carregar ofertas. Verifique a conexão com a API.</div>');
            }
        });
    };

    // Cache do elemento temporário para escape HTML
    const escapeHTML = (str) => {
        return $('<div>').text(str).html();
    };

    const renderCards = (filter = "all") => {
        const filteredData = filter === "all"
            ? dealsData
            : dealsData.filter(d => d.platform === filter || (filter === "under20" && parseFloat(d.price.replace(',', '.')) < 20));

        if (filteredData.length === 0) {
            $grid.html('<div class="col-12 text-center py-5 text-muted">Nenhuma oferta encontrada para este filtro.</div>');
            return;
        }
        let html = '';
        filteredData.forEach(game => {
            let platformIcon = 'fa-gamepad';
            if (game.platform === 'pc' || game.platform === 'under20') platformIcon = 'fa-desktop';
            if (game.platform === 'playstation') platformIcon = 'fa-playstation';
            if (game.platform === 'xbox') platformIcon = 'fa-xbox';
            if (game.platform === 'nintendo') platformIcon = 'fa-gamepad';

            const safeTitle = escapeHTML(game.title);
            const safeStore = escapeHTML(game.store);
            const safeDiscount = escapeHTML(game.discount);
            const safeOldPrice = escapeHTML(String(game.oldPrice));
            const safePrice = escapeHTML(String(game.price));
            const safeImage = escapeHTML(game.image);

            html += `
                <div class="col-lg-3 col-md-6 fade-in-up">
                    <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-danger fw-bold shadow-sm">${safeDiscount}</span>
                        </div>
                        <img src="${safeImage}" class="card-img-top" alt="${safeTitle}">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-white-50"><i class="fab ${platformIcon} me-1"></i> ${safeStore}</small>
                                <small class="text-decoration-line-through text-secondary">R$ ${safeOldPrice}</small>
                            </div>
                            <h5 class="card-title fw-bold mb-auto text-white">${safeTitle}</h5>
                            <div class="d-flex justify-content-between align-items-end mt-3 border-top border-secondary border-opacity-25 pt-3">
                                <div>
                                    <small class="d-block text-success mb-0" style="font-size: 0.8rem;">Melhor Preço</small>
                                    <span class="h4 fw-bold text-white mb-0">R$ ${safePrice}</span>
                                </div>
                                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-primary">
                                    <i class="bi bi-bag-fill me-1"></i> Ver Loja
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $grid.hide().html(html).fadeIn(400);
    };

    // Load API deals on initialization
    loadDeals();

    $filters.on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) return;

        $filters.removeClass('active');
        $this.addClass('active');

        const filter = $this.data('filter');
        $grid.animate({ opacity: 0 }, 200, function () {
            renderCards(filter);
            $(this).animate({ opacity: 1 }, 200);
        });
    });

    return () => {
        $filters.off('click');
    };
}