function initDeals() {
    const $grid = $("#deals-grid");
    const $filters = $(".filter-pill");

    // 1. Render Skeleton Loading
    const renderSkeleton = () => {
        let html = '';
        for (let i = 0; i < 8; i++) {
            html += `
                <div class="col-lg-3 col-md-6">
                    <div class="card h-100 border-0 bg-dark rounded-4 overflow-hidden shadow-sm" style="border: 1px solid rgba(255,255,255,0.05) !important;">
                        <div class="skeleton-shimmer" style="height: 180px; width: 100%;"></div>
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="skeleton-shimmer rounded-pill" style="width: 60px; height: 20px;"></div>
                                <div class="skeleton-shimmer rounded-pill" style="width: 40px; height: 20px;"></div>
                            </div>
                            <div class="skeleton-shimmer mb-2 rounded" style="width: 80%; height: 24px;"></div>
                            <div class="skeleton-shimmer mb-3 rounded" style="width: 40%; height: 16px;"></div>
                            <div class="d-flex justify-content-between align-items-end mt-3">
                                <div>
                                    <div class="skeleton-shimmer mb-1 rounded" style="width: 50px; height: 14px;"></div>
                                    <div class="skeleton-shimmer rounded" style="width: 80px; height: 28px;"></div>
                                </div>
                                <div class="skeleton-shimmer rounded-circle" style="width: 32px; height: 32px;"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        $grid.html(html);
    };

    // 2. Mock Data (Simulando API)
    const dealsData = [
        { id: 1, title: "Elden Ring", price: "149,90", oldPrice: "229,90", discount: "-35%", platform: "pc", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg" },
        { id: 2, title: "God of War Ragnarök", price: "199,50", oldPrice: "349,90", discount: "-43%", platform: "playstation", store: "PS Store", image: "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png" },
        { id: 3, title: "Cyberpunk 2077", price: "99,90", oldPrice: "199,90", discount: "-50%", platform: "xbox", store: "Xbox", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg" },
        { id: 4, title: "Hollow Knight", price: "14,99", oldPrice: "46,99", discount: "-68%", platform: "pc", store: "GOG", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg" },
        { id: 5, title: "Red Dead Redemption 2", price: "89,90", oldPrice: "299,90", discount: "-70%", platform: "pc", store: "Epic", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg" },
        { id: 6, title: "The Witcher 3", price: "19,99", oldPrice: "99,99", discount: "-80%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg" },
        { id: 7, title: "Zelda: Breath of the Wild", price: "199,00", oldPrice: "299,00", discount: "-33%", platform: "nintendo", store: "Nintendo", image: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000025/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a77cf438e3661" },
        { id: 8, title: "Stardew Valley", price: "12,49", oldPrice: "24,99", discount: "-50%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg" }
    ];

    // 3. Render Cards
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

            html += `
                <div class="col-lg-3 col-md-6 fade-in-up">
                    <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-danger fw-bold shadow-sm">${game.discount}</span>
                        </div>
                        <img src="${game.image}" class="card-img-top" alt="${game.title}">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-white-50"><i class="fab ${platformIcon} me-1"></i> ${game.store}</small>
                                <small class="text-decoration-line-through text-muted">R$ ${game.oldPrice}</small>
                            </div>
                            <h5 class="card-title fw-bold mb-auto text-white">${game.title}</h5>
                            <div class="d-flex justify-content-between align-items-end mt-3 border-top border-secondary border-opacity-25 pt-3">
                                <div>
                                    <small class="d-block text-success mb-0" style="font-size: 0.8rem;">Melhor Preço</small>
                                    <span class="h4 fw-bold text-white mb-0">R$ ${game.price}</span>
                                </div>
                                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-primary">
                                    <i class="fas fa-shopping-bag me-1"></i> Ver Loja
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $grid.hide().html(html).fadeIn(400);
    };

    // Inicialização
    renderSkeleton();

    // Simula delay de rede (2 segundos)
    setTimeout(() => {
        renderCards();
    }, 2000);

    // 4. Filter Logic
    $filters.on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) return;

        $filters.removeClass('active');
        $this.addClass('active');

        const filter = $this.data('filter');

        // Efeito visual simples de "recarregamento"
        $grid.animate({ opacity: 0 }, 200, function () {
            renderCards(filter);
            $(this).animate({ opacity: 1 }, 200);
        });
    });
}