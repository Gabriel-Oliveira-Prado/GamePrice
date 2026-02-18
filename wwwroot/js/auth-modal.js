function toggleAuth(e, mode) {
    e.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginFooter = document.getElementById('loginFooter');
    const registerFooter = document.getElementById('registerFooter');
    const authTitle = document.getElementById('authTitle');

    if (mode === 'register') {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        loginFooter.classList.add('d-none');
        registerFooter.classList.remove('d-none');
        authTitle.textContent = 'Criar Conta';
    } else {
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
        loginFooter.classList.remove('d-none');
        registerFooter.classList.add('d-none');
        authTitle.textContent = 'Login';
    }
}