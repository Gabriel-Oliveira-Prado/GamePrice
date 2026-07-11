function initDeals() {
    const $grid = $("#deals-grid");
    const $filters = $(".filter-pill");

    $filters.on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) return;

        $filters.removeClass('active');
        $this.addClass('active');

        const filter = $this.data('filter');
        $grid.animate({ opacity: 0 }, 200, function () {
            const cards = $grid.find(".deal-item-card");
            if (filter === "all") {
                cards.show();
            } else {
                cards.each(function() {
                    const $card = $(this);
                    const platform = $card.data("platform");
                    const priceStr = String($card.data("price")).replace(",", ".");
                    const price = parseFloat(priceStr);

                    if (filter === "under20") {
                        if (price < 20.0) {
                            $card.show();
                        } else {
                            $card.hide();
                        }
                    } else {
                        if (platform === filter) {
                            $card.show();
                        } else {
                            $card.hide();
                        }
                    }
                });
            }
            $(this).animate({ opacity: 1 }, 200);
        });
    });

    return () => {
        $filters.off('click');
    };
}