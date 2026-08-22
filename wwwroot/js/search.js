(function () {
    "use strict";

    const escapeHtml = (value) => {
        const element = document.createElement("div");
        element.textContent = value || "";
        return element.innerHTML;
    };

    const getStoreSlug = (store) => {
        const value = (store || "").toLowerCase();
        if (value.includes("steam")) return "steam";
        if (value.includes("epic")) return "epic-games";
        if (value.includes("playstation") || value.includes("ps store")) return "playstation";
        if (value.includes("xbox")) return "xbox";
        if (value.includes("nintendo")) return "nintendo";
        if (value.includes("gog")) return "gog";
        if (value.includes("nuuvem")) return "nuuvem";
        if (value.includes("itch")) return "itch-io";
        return "";
    };

    const getStoreIconUrl = (slug) => {
        const localIcons = {
            steam: "/img/stores/steam.svg",
            "epic-games": "/img/stores/epic-games.svg",
            playstation: "/img/stores/playstation.svg",
            xbox: "/img/stores/xbox.svg",
            nintendo: "/img/stores/nintendo.svg",
            gog: "/img/stores/gog.svg",
            nuuvem: "/img/stores/nuuvem.svg",
            "itch-io": "/img/stores/itch-io.svg"
        };
        return localIcons[slug] || "";
    };

    function initSearch() {
        const input = document.querySelector(".search-input");
        const button = document.querySelector(".search-btn");
        const results = document.getElementById("search-results");

        if (!input || !button || !results || input.dataset.searchReady === "true") return;
        input.dataset.searchReady = "true";

        let debounceTimer = 0;
        let activeController = null;

        const setVisible = (visible) => {
            results.style.display = visible ? "block" : "none";
            input.setAttribute("aria-expanded", visible ? "true" : "false");
        };

        const setButtonBusy = (busy) => {
            button.disabled = busy;
            button.innerHTML = busy
                ? '<i class="bi bi-hourglass" aria-hidden="true"></i><span>Buscando</span>'
                : '<i class="bi bi-search" aria-hidden="true"></i><span>Comparar</span>';
        };

        const renderState = (message, isError) => {
            results.innerHTML = `<div class="search-state${isError ? " error" : ""}">${escapeHtml(message)}</div>`;
            setVisible(true);
        };

        const renderResults = (items) => {
            const games = (items || []).filter((item) => item && item.title).slice(0, 8);
            if (games.length === 0) {
                renderState("Nenhum jogo encontrado. Tente outro nome.", false);
                return;
            }

            results.innerHTML = games.map((game) => {
                const rawTitle = String(game.title || "").trim();
                const title = escapeHtml(rawTitle);
                const price = escapeHtml(game.isFree ? "Grátis" : (game.price || "Ver ofertas"));
                const store = escapeHtml(game.store || "Catálogo");
                const image = escapeHtml(game.image || "");
                const slug = getStoreSlug(game.store);
                const iconUrl = getStoreIconUrl(slug);
                const offerCount = Math.max(Number(game.offerCount) || 0, game.store ? 1 : 0);
                const additionalStores = Math.max(offerCount - 1, 0);
                const storeMarkClass = slug === "nuuvem"
                    ? " search-store-mark-wide"
                    : (slug === "nintendo" ? " search-store-mark-word" : "");
                const storeMark = iconUrl
                    ? `<span class="search-store-mark${storeMarkClass}"><img src="${iconUrl}" alt=""></span>`
                    : '<i class="bi bi-shop" aria-hidden="true"></i>';
                const storeCount = additionalStores > 0
                    ? `<span class="search-store-count" aria-label="Mais ${additionalStores} ${additionalStores === 1 ? "loja encontrada" : "lojas encontradas"}">+${additionalStores} ${additionalStores === 1 ? "loja" : "lojas"}</span>`
                    : "";
                const cover = image
                    ? `<img src="${image}" alt="Capa de ${title}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'), { className: 'search-result-cover' }))">`
                    : '<span class="search-result-cover"></span>';

                return `
                    <a class="search-result" role="option" href="/Search/Details?gameName=${encodeURIComponent(rawTitle)}">
                        ${cover}
                        <span class="search-result-copy">
                            <strong>${title}</strong>
                            <span class="search-result-meta">
                                <span class="search-result-price">${price}</span>
                                <span>${storeMark}${store}</span>
                                ${storeCount}
                            </span>
                        </span>
                        <i class="bi bi-chevron-right search-result-action" aria-hidden="true"></i>
                    </a>`;
            }).join("");
            setVisible(true);
        };

        const performSearch = async (showButtonBusy) => {
            const query = input.value.trim();
            if (query.length < 2) {
                setVisible(false);
                return;
            }

            if (activeController) activeController.abort();
            const controller = new AbortController();
            activeController = controller;
            const timeout = window.setTimeout(() => controller.abort(), 20000);

            if (showButtonBusy) setButtonBusy(true);
            renderState("Buscando jogos...", false);

            try {
                const response = await fetch(`/Search/SearchGame?query=${encodeURIComponent(query)}`, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`Search failed with ${response.status}`);
                renderResults(await response.json());
            } catch (error) {
                if (error.name !== "AbortError" || activeController === controller) {
                    const message = error.name === "AbortError"
                        ? "A consulta demorou demais. Tente novamente."
                        : "Não foi possível pesquisar agora.";
                    renderState(message, true);
                }
            } finally {
                window.clearTimeout(timeout);
                if (activeController === controller) activeController = null;
                if (showButtonBusy) setButtonBusy(false);
            }
        };

        button.addEventListener("click", () => performSearch(true));

        input.addEventListener("input", () => {
            window.clearTimeout(debounceTimer);
            if (input.value.trim().length < 2) {
                if (activeController) activeController.abort();
                setVisible(false);
                return;
            }
            debounceTimer = window.setTimeout(() => performSearch(false), 320);
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch(true);
            }
            if (event.key === "Escape") setVisible(false);
            if (event.key === "ArrowDown") {
                const firstResult = results.querySelector(".search-result");
                if (firstResult) {
                    event.preventDefault();
                    firstResult.focus();
                }
            }
        });

        results.addEventListener("keydown", (event) => {
            const links = Array.from(results.querySelectorAll(".search-result"));
            const currentIndex = links.indexOf(document.activeElement);
            if (event.key === "ArrowDown" && currentIndex < links.length - 1) {
                event.preventDefault();
                links[currentIndex + 1].focus();
            }
            if (event.key === "ArrowUp") {
                event.preventDefault();
                if (currentIndex > 0) links[currentIndex - 1].focus();
                else input.focus();
            }
            if (event.key === "Escape") {
                setVisible(false);
                input.focus();
            }
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".search-container")) setVisible(false);
        });
    }

    window.initSearch = initSearch;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSearch);
    } else {
        initSearch();
    }
})();
