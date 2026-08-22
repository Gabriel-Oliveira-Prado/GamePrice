(function () {
    "use strict";

    const refreshIntervalMs = 15 * 60 * 1000;
    const storeIcons = [
        ["steam", "/img/stores/steam.svg", ""],
        ["epic", "/img/stores/epic-games.svg", ""],
        ["playstation", "/img/stores/playstation.svg", ""],
        ["ps store", "/img/stores/playstation.svg", ""],
        ["xbox", "/img/stores/xbox.svg", ""],
        ["nintendo", "/img/stores/nintendo.svg", "store-mark-word"],
        ["gog", "/img/stores/gog.svg", ""],
        ["nuuvem", "/img/stores/nuuvem.svg", "store-mark-wide"],
        ["itch", "/img/stores/itch-io.svg", ""]
    ];

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function parsePrice(value) {
        const text = normalize(value);
        if (text.includes("gratis") || text.includes("free") || text.includes("gratuito")) return 0;

        const numeric = text
            .replace(/[^0-9,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        return Number.parseFloat(numeric);
    }

    function formatPrice(value) {
        const text = String(value || "").trim();
        if (!text) return "";
        if (["gratis", "free", "gratuito"].some((term) => normalize(text).includes(term))) return "Grátis";
        return /^r\$/i.test(text) ? text : `R$ ${text}`;
    }

    function createStoreMark(store) {
        const normalizedStore = normalize(store);
        const icon = storeIcons.find(([term]) => normalizedStore.includes(term));
        const mark = document.createElement("span");
        mark.className = "store-mark";
        mark.setAttribute("aria-hidden", "true");

        if (icon) {
            if (icon[2]) mark.classList.add(icon[2]);
            const image = document.createElement("img");
            image.src = icon[1];
            image.alt = "";
            image.loading = "lazy";
            mark.appendChild(image);
        } else {
            const fallback = document.createElement("i");
            fallback.className = "bi bi-shop";
            mark.appendChild(fallback);
        }

        return mark;
    }

    function createDealCard(deal) {
        const title = String(deal.title || "Jogo").trim();
        const store = String(deal.store || "Loja oficial").trim();
        const card = document.createElement("article");
        card.className = "deal-item-card product-card";
        card.dataset.platform = normalize(deal.platform || "pc");
        card.dataset.price = String(parsePrice(deal.price));

        const link = document.createElement("a");
        link.className = "product-link";
        link.href = `/Search/Details?${new URLSearchParams({ gameName: title })}`;
        link.setAttribute("aria-label", `Comparar preços de ${title}`);

        const cover = document.createElement("div");
        cover.className = "game-cover";
        if (deal.image) {
            const image = document.createElement("img");
            image.src = deal.image;
            image.alt = `Capa de ${title}`;
            image.loading = "lazy";
            image.addEventListener("error", () => {
                cover.classList.add("image-missing");
                image.remove();
            });
            cover.appendChild(image);
        } else {
            cover.classList.add("image-missing");
        }

        if (deal.discount) {
            const discount = document.createElement("span");
            discount.className = "discount-label";
            discount.textContent = deal.discount;
            cover.appendChild(discount);
        }

        const body = document.createElement("div");
        body.className = "product-body";
        const storeLine = document.createElement("div");
        storeLine.className = "store-line";
        storeLine.appendChild(createStoreMark(store));
        const storeName = document.createElement("span");
        storeName.textContent = store;
        storeLine.appendChild(storeName);

        const heading = document.createElement("h3");
        heading.textContent = title;
        const priceBlock = document.createElement("div");
        priceBlock.className = "price-block";
        const prices = document.createElement("div");
        if (deal.oldPrice) {
            const oldPrice = document.createElement("span");
            oldPrice.className = "old-price";
            oldPrice.textContent = formatPrice(deal.oldPrice);
            prices.appendChild(oldPrice);
        }
        const currentPrice = document.createElement("strong");
        currentPrice.textContent = formatPrice(deal.price);
        prices.appendChild(currentPrice);
        const arrow = document.createElement("i");
        arrow.className = "bi bi-arrow-up-right";
        arrow.setAttribute("aria-hidden", "true");
        priceBlock.append(prices, arrow);

        body.append(storeLine, heading, priceBlock);
        link.append(cover, body);
        card.appendChild(link);
        return card;
    }

    function renderDeals(grid, deals) {
        grid.replaceChildren();
        if (!Array.isArray(deals) || deals.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            const icon = document.createElement("i");
            icon.className = "bi bi-tag";
            icon.setAttribute("aria-hidden", "true");
            const message = document.createElement("p");
            message.textContent = "Nenhuma oferta disponível no momento.";
            empty.append(icon, message);
            grid.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        deals.forEach((deal) => fragment.appendChild(createDealCard(deal)));
        grid.appendChild(fragment);
    }

    function initDeals() {
        const grid = document.getElementById("deals-grid");
        const filters = Array.from(document.querySelectorAll(".filter-pill"));
        if (!grid || filters.length === 0) return;

        let activeFilter = filters.find((button) => button.classList.contains("active"))?.dataset.filter || "all";
        let lastRefreshAt = Date.now();
        let refreshInProgress = false;

        function applyFilter() {
            grid.querySelectorAll(".deal-item-card").forEach((card) => {
                const platform = card.dataset.platform;
                const price = Number.parseFloat(card.dataset.price || "");
                const visible = activeFilter === "all"
                    || (activeFilter === "under20" && Number.isFinite(price) && price <= 20)
                    || platform === activeFilter;
                card.hidden = !visible;
            });
        }

        filters.forEach((button) => {
            button.addEventListener("click", () => {
                activeFilter = button.dataset.filter || "all";
                filters.forEach((item) => {
                    const selected = item === button;
                    item.classList.toggle("active", selected);
                    item.setAttribute("aria-pressed", String(selected));
                });
                applyFilter();
            });
        });

        async function refreshDeals() {
            if (refreshInProgress || document.hidden) return;
            refreshInProgress = true;

            try {
                const response = await fetch("/Search/GetDeals", {
                    headers: { Accept: "application/json" },
                    cache: "no-store"
                });
                if (!response.ok) return;

                const deals = await response.json();
                if (!Array.isArray(deals) || deals.length === 0) return;

                renderDeals(grid, deals);
                applyFilter();
                lastRefreshAt = Date.now();
            } catch {
                // A lista renderizada pelo servidor permanece visível em falhas temporárias.
            } finally {
                refreshInProgress = false;
            }
        }

        window.setInterval(refreshDeals, refreshIntervalMs);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && Date.now() - lastRefreshAt >= refreshIntervalMs) refreshDeals();
        });

        applyFilter();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initDeals);
    } else {
        initDeals();
    }
})();
