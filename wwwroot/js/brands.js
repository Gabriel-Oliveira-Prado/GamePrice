// brands.js
document.addEventListener("DOMContentLoaded", function () {
    const marqueeContent = document.querySelector(".marquee-content");
    if (marqueeContent) {
        // Obter os itens originais
        const originalItems = marqueeContent.innerHTML;

        // Adicionar exatamente mais 5 repetições, totalizando 6 blocos idênticos.
        // O CSS foi ajustado para trasladar calc(-100% / 6) para um loop 100% perfeito
        for (let i = 0; i < 5; i++) {
            marqueeContent.innerHTML += originalItems;
        }
    }
});
