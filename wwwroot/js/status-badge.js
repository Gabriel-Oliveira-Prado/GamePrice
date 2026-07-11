document.addEventListener('DOMContentLoaded', () => {
    const REFRESH_INTERVAL = 30000; // 30 segundos
    let lastUpdate = null;

    const badgeOnline = (label) =>
        `<span class="badge bg-success bg-opacity-25 text-success rounded-pill border border-success"><i class="bi bi-check-circle-fill me-1"></i>${label}</span>`;

    const badgeOffline = (label) =>
        `<span class="badge bg-danger bg-opacity-25 text-danger rounded-pill border border-danger"><i class="bi bi-x-circle-fill me-1"></i>${label}</span>`;

    const badgeLoading = () =>
        `<span class="badge bg-secondary bg-opacity-25 text-secondary rounded-pill border border-secondary"><i class="bi bi-hourglass-split me-1"></i>Verificando...</span>`;

    const overallBadge = (status) => {
        if (status === 'stable') return `<span class="badge bg-success rounded-pill">Estável</span>`;
        if (status === 'degraded') return `<span class="badge bg-warning rounded-pill text-dark">Instável</span>`;
        return `<span class="badge bg-danger rounded-pill">Offline</span>`;
    };

    const latencyColor = (ms) => {
        if (ms <= 100) return 'text-success';
        if (ms <= 300) return 'text-warning';
        return 'text-danger';
    };

    const timeAgo = () => {
        if (!lastUpdate) return 'Verificando...';
        const diff = Math.floor((Date.now() - lastUpdate) / 1000);
        if (diff < 5) return 'Agora mesmo';
        if (diff < 60) return `${diff}s atrás`;
        return `${Math.floor(diff / 60)}min atrás`;
    };

    function buildStatusHTML(data) {
        const apiStatus = data ? (data.api.online ? badgeOnline('Online') : badgeOffline('Offline')) : badgeLoading();
        const scraperStatus = data ? (data.scraper.online ? badgeOnline('Online') : badgeOffline('Offline')) : badgeLoading();
        const overall = data ? overallBadge(data.overall) : `<span class="badge bg-secondary rounded-pill">Carregando</span>`;

        const apiLatency = data && data.api.online
            ? `<span class="${latencyColor(data.api.latency)} fw-bold small">${data.api.latency} ms</span>`
            : `<span class="text-secondary small">—</span>`;

        const scraperLatency = data && data.scraper.online
            ? `<span class="${latencyColor(data.scraper.latency)} fw-bold small">${data.scraper.latency} ms</span>`
            : `<span class="text-secondary small">—</span>`;

        // Detalhes extras se a API estiver online
        let extraDetails = '';
        if (data && data.api.online && data.api.details) {
            const details = data.api.details;
            const memoryText = details.memory ? `${details.memory.allocatedMb} MB / ${details.memory.systemPrivateMb} MB` : 'N/A';
            const uptimeText = details.uptime || 'N/A';
            const dbStatus = details.database || 'Online';
            
            extraDetails = `
                <div class="mt-3 pt-2 border-top border-secondary border-opacity-50">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-white-50 small"><i class="bi bi-clock me-1 text-primary"></i>Uptime API</span>
                        <span class="text-white small fw-semibold text-end">${uptimeText}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-white-50 small"><i class="bi bi-database me-1 text-primary"></i>Banco</span>
                        <span class="text-success small fw-semibold">${dbStatus}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-white-50 small"><i class="bi bi-cpu me-1 text-primary"></i>RAM (Aloc/Priv)</span>
                        <span class="text-white-50 small text-end">${memoryText}</span>
                    </div>
                </div>
            `;
        }

        return `
            <h6 class="dropdown-header text-white px-0 fw-bold border-bottom border-secondary pb-2 mb-3 d-flex justify-content-between align-items-center">
                Status do Sistema
                ${overall}
            </h6>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <i class="bi bi-server text-white-50 me-2"></i>
                    <span class="text-white-50 small">API Principal</span>
                </div>
                ${apiStatus}
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <i class="bi bi-activity text-white-50 me-2"></i>
                    <span class="text-white-50 small">Latência API</span>
                </div>
                ${apiLatency}
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <i class="bi bi-cloud-arrow-down text-white-50 me-2"></i>
                    <span class="text-white-50 small">Crawlers das Lojas</span>
                </div>
                ${scraperStatus}
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <i class="bi bi-speedometer2 text-white-50 me-2"></i>
                    <span class="text-white-50 small">Latência Scraper</span>
                </div>
                ${scraperLatency}
            </div>

            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <i class="bi bi-whatsapp text-white-50 me-2"></i>
                    <span class="text-white-50 small">Serviço de Alertas</span>
                </div>
                ${badgeOnline('Ativo')}
            </div>

            ${extraDetails}

            <div class="mt-3 pt-2 border-top border-secondary text-center d-flex justify-content-between align-items-center">
                <span class="text-secondary status-text-xs"><i class="bi bi-clock-history me-1"></i>Atualizado ${timeAgo()}</span>
                <button type="button" class="btn btn-link text-primary p-0 btn-status-refresh" style="font-size: 0.75rem; text-decoration: none;" onclick="event.stopPropagation(); triggerCheckStatus();"><i class="bi bi-arrow-clockwise me-1"></i>Atualizar</button>
            </div>
        `;
    }

    function updateStatusUI(data) {
        const desktopMenu = document.getElementById('desktop-status-menu');
        const mobileMenu = document.getElementById('mobile-status-menu');

        const html = buildStatusHTML(data);

        if (desktopMenu) desktopMenu.innerHTML = html;
        if (mobileMenu) mobileMenu.innerHTML = html;

        // Atualiza o pulse dot na hero section
        const pulseDots = document.querySelectorAll('.pulse-dot');
        pulseDots.forEach(dot => {
            dot.style.background = data
                ? (data.overall === 'stable' ? '#10b981' : (data.overall === 'degraded' ? '#f59e0b' : '#ef4444'))
                : '#6b7280';
        });
    }

    async function checkStatus() {
        try {
            const response = await fetch('/Search/Status', { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error('Status check failed');
            const data = await response.json();
            lastUpdate = Date.now();
            updateStatusUI(data);
        } catch (e) {
            console.warn('Status check falhou:', e.message);
            updateStatusUI({
                overall: 'offline',
                api: { online: false, latency: 0 },
                scraper: { online: false, latency: 0 }
            });
            lastUpdate = Date.now();
        }
    }

    // Expor globalmente para o botão "Atualizar" no dropdown
    window.triggerCheckStatus = checkStatus;

    // Mostra estado de carregamento imediatamente
    updateStatusUI(null);

    // Primeira verificação real
    checkStatus();

    // Verifica a cada 30 segundos
    setInterval(checkStatus, REFRESH_INTERVAL);

    // Atualiza o "tempo atrás" a cada 10 segundos
    setInterval(() => {
        const timeSpans = document.querySelectorAll('.status-text-xs');
        timeSpans.forEach(span => {
            const icon = '<i class="bi bi-clock-history me-1"></i>';
            span.innerHTML = `${icon}Atualizado ${timeAgo()}`;
        });
    }, 10000);
});
