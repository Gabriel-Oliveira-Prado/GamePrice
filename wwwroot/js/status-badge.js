document.addEventListener('DOMContentLoaded', () => {
    const statusContent = `
        <h6 class="dropdown-header text-white px-0 fw-bold border-bottom border-secondary pb-2 mb-3 d-flex justify-content-between align-items-center">
            Status do Sistema
            <span class="badge bg-success rounded-pill">Estável</span>
        </h6>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
                <i class="bi bi-server text-white-50 me-2"></i>
                <span class="text-white-50 small">API Principal</span>
            </div>
            <span class="badge bg-success bg-opacity-25 text-success rounded-pill border border-success"><i class="bi bi-check-circle-fill me-1"></i> Online</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
                <i class="bi bi-activity text-white-50 me-2"></i>
                <span class="text-white-50 small">Latência</span>
            </div>
            <span class="text-white fw-bold small">43 ms</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
                <i class="bi bi-cloud-arrow-down text-white-50 me-2"></i>
                <span class="text-white-50 small">Crawlers das Lojas</span>
            </div>
            <span class="badge bg-success bg-opacity-25 text-success rounded-pill border border-success"><i class="bi bi-check-circle-fill me-1"></i> Online</span>
        </div>

        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="bi bi-whatsapp text-white-50 me-2"></i>
                <span class="text-white-50 small">Serviço de Alertas</span>
            </div>
            <span class="badge bg-danger bg-opacity-25 text-danger rounded-pill border border-danger"><i class="bi bi-x-circle-fill me-1"></i> Offline</span>
        </div>

        <div class="mt-3 pt-2 border-top border-secondary text-center">
            <span class="text-secondary status-text-xs"><i class="bi bi-clock-history me-1"></i> Atualizado há poucos segundos</span>
        </div>
    `;

    const desktopMenu = document.getElementById('desktop-status-menu');
    if (desktopMenu) {
        desktopMenu.innerHTML = statusContent;
    }

    const mobileMenu = document.getElementById('mobile-status-menu');
    if (mobileMenu) {
        const mobileContent = statusContent.replace('dropdown-header', '');
        mobileMenu.innerHTML = mobileContent;
    }
});
