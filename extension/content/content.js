/**
 * SamuraiVault Content Script
 * Detects password forms and prompts to save credentials
 */

(function () {
    'use strict';

    // Track forms we've already processed
    const processedForms = new WeakSet();
    let pendingCredentials = null;

    /**
     * Find password fields on the page
     */
    function findPasswordFields() {
        return document.querySelectorAll('input[type="password"]');
    }

    /**
     * Find the username/email field near a password field
     */
    function findUsernameField(passwordField) {
        const form = passwordField.closest('form');
        const container = form || document.body;

        // Common username field selectors
        const selectors = [
            'input[type="email"]',
            'input[type="text"][name*="user"]',
            'input[type="text"][name*="email"]',
            'input[type="text"][name*="login"]',
            'input[type="text"][id*="user"]',
            'input[type="text"][id*="email"]',
            'input[type="text"][id*="login"]',
            'input[autocomplete="username"]',
            'input[autocomplete="email"]',
        ];

        for (const selector of selectors) {
            const field = container.querySelector(selector);
            if (field && field !== passwordField) {
                return field;
            }
        }

        // Fallback: find the text input right before the password field
        const allInputs = container.querySelectorAll('input[type="text"], input[type="email"]');
        for (const input of allInputs) {
            if (input.compareDocumentPosition(passwordField) & Node.DOCUMENT_POSITION_FOLLOWING) {
                return input;
            }
        }

        return null;
    }

    /**
     * Get site name from URL
     */
    function getSiteName() {
        const hostname = window.location.hostname;
        // Remove www. prefix and get domain name
        return hostname.replace(/^www\./, '').split('.')[0];
    }

    /**
     * Show the save password notification
     */
    function showSavePrompt(credentials) {
        // Remove any existing prompt
        removeSavePrompt();

        const overlay = document.createElement('div');
        overlay.id = 'samurai-vault-prompt';
        overlay.innerHTML = `
            <div class="sv-prompt-container">
                <div class="sv-prompt-header">
                    <span class="sv-logo">⚔️</span>
                    <span class="sv-title">SamuraiVault</span>
                    <button class="sv-close" id="sv-close-btn">&times;</button>
                </div>
                <div class="sv-prompt-body">
                    <p class="sv-message">Save this password?</p>
                    <div class="sv-field">
                        <label>Site</label>
                        <input type="text" id="sv-site" value="${escapeHtml(credentials.site)}" />
                    </div>
                    <div class="sv-field">
                        <label>Username</label>
                        <input type="text" id="sv-username" value="${escapeHtml(credentials.username)}" />
                    </div>
                    <div class="sv-field">
                        <label>Password</label>
                        <input type="password" id="sv-password" value="${escapeHtml(credentials.password)}" />
                    </div>
                </div>
                <div class="sv-prompt-footer">
                    <button class="sv-btn sv-btn-secondary" id="sv-cancel-btn">Not Now</button>
                    <button class="sv-btn sv-btn-primary" id="sv-save-btn">Save</button>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #samurai-vault-prompt {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .sv-prompt-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(199, 77, 77, 0.3);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                width: 320px;
                overflow: hidden;
                animation: sv-slide-in 0.3s ease-out;
            }
            @keyframes sv-slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .sv-prompt-header {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: rgba(199, 77, 77, 0.1);
                border-bottom: 1px solid rgba(199, 77, 77, 0.2);
            }
            .sv-logo { font-size: 20px; margin-right: 8px; }
            .sv-title {
                flex: 1;
                font-weight: 600;
                font-size: 14px;
                background: linear-gradient(135deg, #c74d4d, #d4a574);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .sv-close {
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .sv-close:hover { color: #fff; }
            .sv-prompt-body { padding: 16px; }
            .sv-message {
                color: #e2e8f0;
                font-size: 14px;
                margin: 0 0 16px 0;
            }
            .sv-field {
                margin-bottom: 12px;
            }
            .sv-field label {
                display: block;
                color: #a0aec0;
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            .sv-field input {
                width: 100%;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #e2e8f0;
                font-size: 13px;
                box-sizing: border-box;
            }
            .sv-field input:focus {
                outline: none;
                border-color: #c74d4d;
            }
            .sv-prompt-footer {
                display: flex;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.2);
            }
            .sv-btn {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .sv-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #a0aec0;
            }
            .sv-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #e2e8f0;
            }
            .sv-btn-primary {
                background: linear-gradient(135deg, #c74d4d 0%, #a83232 100%);
                color: #fff;
            }
            .sv-btn-primary:hover {
                background: linear-gradient(135deg, #d45555 0%, #b83a3a 100%);
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(overlay);

        // Event handlers
        document.getElementById('sv-close-btn').addEventListener('click', removeSavePrompt);
        document.getElementById('sv-cancel-btn').addEventListener('click', removeSavePrompt);
        document.getElementById('sv-save-btn').addEventListener('click', handleSave);
    }

    /**
     * Remove the save prompt
     */
    function removeSavePrompt() {
        const prompt = document.getElementById('samurai-vault-prompt');
        if (prompt) {
            prompt.remove();
        }
    }

    /**
     * Handle save button click
     */
    function handleSave() {
        const site = document.getElementById('sv-site').value;
        const username = document.getElementById('sv-username').value;
        const password = document.getElementById('sv-password').value;
        const url = window.location.href;

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'savePassword',
            data: {
                site_name: site,
                url: url,
                username: username,
                password: password
            }
        }, (response) => {
            if (response && response.success) {
                showToast('Password saved to SamuraiVault!', 'success');
            } else {
                showToast(response?.error || 'Failed to save password', 'error');
            }
            removeSavePrompt();
        });
    }

    /**
     * Show a toast notification
     */
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.id = 'samurai-vault-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 2147483647;
            animation: sv-toast-in 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * Handle form submission
     */
    function handleFormSubmit(event) {
        const form = event.target;
        const passwordField = form.querySelector('input[type="password"]');

        if (!passwordField || !passwordField.value) {
            return;
        }

        const usernameField = findUsernameField(passwordField);
        const username = usernameField ? usernameField.value : '';

        if (username && passwordField.value) {
            pendingCredentials = {
                site: getSiteName(),
                username: username,
                password: passwordField.value,
                url: window.location.href
            };

            // Show prompt after a short delay (to let the form submit)
            setTimeout(() => {
                if (pendingCredentials) {
                    showSavePrompt(pendingCredentials);
                    pendingCredentials = null;
                }
            }, 500);
        }
    }

    /**
     * Set up form listeners
     */
    function setupFormListeners() {
        const passwordFields = findPasswordFields();

        passwordFields.forEach(field => {
            const form = field.closest('form');
            if (form && !processedForms.has(form)) {
                processedForms.add(form);
                form.addEventListener('submit', handleFormSubmit);
            }
        });
    }

    /**
     * Initialize the content script
     */
    function init() {
        // Set up listeners for existing forms
        setupFormListeners();

        // Watch for dynamically added forms
        const observer = new MutationObserver((mutations) => {
            let shouldSetup = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldSetup = true;
                    break;
                }
            }
            if (shouldSetup) {
                setupFormListeners();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'checkLoginStatus') {
                sendResponse({ hasPasswordForms: findPasswordFields().length > 0 });
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
