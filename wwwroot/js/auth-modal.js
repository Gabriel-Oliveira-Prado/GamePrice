document.addEventListener('DOMContentLoaded', () => {
    const loginTabEl = document.getElementById('login-tab');
    const registerTabEl = document.getElementById('register-tab');

    const toggleFooters = (mode) => {
        const loginFooter = document.getElementById('loginFooter');
        const registerFooter = document.getElementById('registerFooter');
        if(loginFooter && registerFooter) {
            if (mode === 'register') {
                loginFooter.classList.add('d-none');
                registerFooter.classList.remove('d-none');
            } else {
                loginFooter.classList.remove('d-none');
                registerFooter.classList.add('d-none');
            }
        }
    };

    if (loginTabEl) {
        loginTabEl.addEventListener('shown.bs.tab', () => toggleFooters('login'));
    }
    if (registerTabEl) {
        registerTabEl.addEventListener('shown.bs.tab', () => toggleFooters('register'));
    }
});

function toggleAuth(e, mode) {
    if (e) e.preventDefault();
    if (mode === 'register') {
        document.getElementById('register-tab')?.click();
    } else {
        document.getElementById('login-tab')?.click();
    }
}