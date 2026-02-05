/**
 * SamuraiVault Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const loggedInView = document.getElementById('logged-in-view');
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const errorMsg = document.getElementById('error-msg');

    // Check if already logged in
    const authStatus = await chrome.runtime.sendMessage({ action: 'checkAuth' });

    if (authStatus.isLoggedIn) {
        showLoggedInView(authStatus.user);
    } else {
        showLoginView();
    }

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        errorMsg.textContent = '';

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'login',
                email: email,
                password: password
            });

            if (response.success) {
                showLoggedInView(response.user);
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            // Check if MFA is required - redirect to website for MFA login
            if (error.message === 'MFA code required') {
                errorMsg.style.color = '#d4a574'; // Gold color for info
                errorMsg.textContent = 'MFA required. Opening website login...';
                // Open website login page in a new tab
                setTimeout(() => {
                    chrome.tabs.create({ url: 'http://localhost:5174/login' });
                }, 500);
            } else {
                errorMsg.style.color = '#ef4444'; // Red color for error
                errorMsg.textContent = error.message;
            }
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ action: 'logout' });
        showLoginView();
    });

    function showLoginView() {
        loginView.classList.remove('hidden');
        loggedInView.classList.add('hidden');
    }

    function showLoggedInView(user) {
        loginView.classList.add('hidden');
        loggedInView.classList.remove('hidden');

        if (user) {
            document.getElementById('user-avatar').textContent =
                (user.username?.[0] || user.email?.[0] || 'U').toUpperCase();
            document.getElementById('username').textContent = user.username || 'User';
            document.getElementById('user-email').textContent = user.email || '';
        }
    }
});
