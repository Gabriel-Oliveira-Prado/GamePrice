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
    const dealsData = [
        { id: 1, title: "Elden Ring", price: "149,90", oldPrice: "229,90", discount: "-35%", platform: "pc", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg" },
        { id: 2, title: "God of War Ragnarök", price: "199,50", oldPrice: "349,90", discount: "-43%", platform: "playstation", store: "PS Store", image: "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png" },
        { id: 3, title: "Cyberpunk 2077", price: "99,90", oldPrice: "199,90", discount: "-50%", platform: "xbox", store: "Xbox", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg" },
        { id: 4, title: "Hollow Knight", price: "14,99", oldPrice: "46,99", discount: "-68%", platform: "pc", store: "GOG", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg" },
        { id: 5, title: "Red Dead Redemption 2", price: "89,90", oldPrice: "299,90", discount: "-70%", platform: "pc", store: "Epic", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg" },
        { id: 6, title: "The Witcher 3", price: "19,99", oldPrice: "99,99", discount: "-80%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg" },
        { id: 7, title: "Zelda: Breath of the Wild", price: "199,00", oldPrice: "299,00", discount: "-33%", platform: "nintendo", store: "Nintendo", image: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero" },
        { id: 8, title: "Stardew Valley", price: "12,49", oldPrice: "24,99", discount: "-50%", platform: "under20", store: "Steam", image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg" }
    ];
    // Cache do elemento temporário para escape HTML
    const escapeDiv = document.createElement('div');
    const escapeHTML = (str) => {
        escapeDiv.textContent = str;
        return escapeDiv.innerHTML;
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            'pc': 'fa-desktop',
            'under20': 'fa-desktop',
            'playstation': 'fa-playstation',
            'xbox': 'fa-xbox',
            'nintendo': 'fa-gamepad'
        };
        return icons[platform] || 'fa-gamepad';
    };

    const filterDeals = (filter) => {
        if (filter === "all") return dealsData;

        return dealsData.filter(d => {
            if (d.platform === filter) return true;
            if (filter === "under20") {
                if (!d._parsedPrice) {
                    d._parsedPrice = parseFloat(d.price.replace(',', '.'));
                }
                return d._parsedPrice < 20;
            }
            return false;
        });
    };

    const renderCards = (filter = "all") => {
        const filteredData = filterDeals(filter);

        if (filteredData.length === 0) {
            $grid.html('<div class="col-12 text-center py-5 text-muted">Nenhuma oferta encontrada para este filtro.</div>');
            return;
        }

        const html = filteredData.map(game => {
            const platformIcon = getPlatformIcon(game.platform);
            const safeTitle = escapeHTML(game.title);
            const safeStore = escapeHTML(game.store);
            const safeDiscount = escapeHTML(game.discount);
            const safeOldPrice = escapeHTML(game.oldPrice);
            const safePrice = escapeHTML(game.price);
            const safeImage = escapeHTML(game.image);

            return `
                <div class="col-lg-3 col-md-6 fade-in-up">
                    <div class="card deal-card h-100 border-0 bg-dark text-white rounded-4 overflow-hidden position-relative glass-effect">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-danger fw-bold shadow-sm">${safeDiscount}</span>
                        </div>
                        <img src="${safeImage}" class="card-img-top" alt="${safeTitle}" loading="lazy">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-white-50"><i class="fab ${platformIcon} me-1"></i> ${safeStore}</small>
                                <small class="text-decoration-line-through text-secondary">R$ ${safeOldPrice}</small>
                            </div>
                            <h5 class="card-title fw-bold mb-auto text-white">${safeTitle}</h5>
                            <a href="#" class="card-price-link text-decoration-none">
                                <div class="text-center mt-3 border-top border-secondary pt-3 price-hover-container">
                                    <small class="text-success mb-1 price-old-text price-label">Melhor Preço</small>
                                    <div class="price-display">
                                        <i class="bi bi-box-arrow-up-right me-2 price-icon"></i>
                                        <span class="h4 fw-bold text-white mb-0 price-value">R$ ${safePrice}</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $grid.hide().html(html).fadeIn(400);
    };

    renderSkeleton();

    const renderTimeout = setTimeout(() => {
        renderCards();
    }, 2000);

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
        clearTimeout(renderTimeout);
        $filters.off('click');
    };
}