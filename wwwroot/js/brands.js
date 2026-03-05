(function() {
    'use strict';

    function initMarquee() {
        const marqueeContent = document.querySelector(".marquee-content");
        if (!marqueeContent || !marqueeContent.children.length) return;

        const fragment = document.createDocumentFragment();
        const originalItems = Array.from(marqueeContent.children);

        for (let i = 0; i < 2; i++) {
            originalItems.forEach(item => {
                fragment.appendChild(item.cloneNode(true));
            });
        }

        marqueeContent.appendChild(fragment);
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initMarquee);
    } else {
        initMarquee();
    }
})();
