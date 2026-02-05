/**
 * SamuraiVault Background Service Worker
 * Handles API communication and storage
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Get stored auth data
 */
async function getAuthData() {
    const result = await chrome.storage.local.get(['access_token', 'master_password']);
    return result;
}

/**
 * Save auth data
 */
async function saveAuthData(accessToken, masterPassword) {
    await chrome.storage.local.set({
        access_token: accessToken,
        master_password: masterPassword
    });
}

/**
 * Clear auth data
 */
async function clearAuthData() {
    await chrome.storage.local.remove(['access_token', 'master_password']);
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const authData = await getAuthData();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authData.access_token) {
        headers['Authorization'] = `Bearer ${authData.access_token}`;
    }

    if (authData.master_password && endpoint.includes('/vault')) {
        headers['X-Master-Password'] = authData.master_password;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        await clearAuthData();
        throw new Error('Authentication expired. Please log in again.');
    }

    // Parse JSON once
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
    }

    return data;
}

/**
 * Login to SamuraiVault
 */
async function login(email, password, mfaCode = null) {
    console.log('Login attempt:', { email, hasPassword: !!password, mfaCode });

    const body = {
        email: email,
        master_password: password,
        mfa_code: mfaCode
    };

    console.log('Request body:', JSON.stringify(body));

    const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
    });

    if (response.access_token) {
        await saveAuthData(response.access_token, password);
        return { success: true, user: response.user };
    }

    throw new Error('Login failed');
}

/**
 * Save password to vault
 */
async function savePassword(data) {
    return apiRequest('/api/vault/add', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Check if user is logged in
 */
async function checkAuth() {
    try {
        const authData = await getAuthData();
        if (!authData.access_token) {
            return { isLoggedIn: false };
        }

        const user = await apiRequest('/api/auth/me', { method: 'GET' });
        return { isLoggedIn: true, user };
    } catch (error) {
        return { isLoggedIn: false };
    }
}

/**
 * Logout
 */
async function logout() {
    await clearAuthData();
    return { success: true };
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleMessage = async () => {
        try {
            switch (message.action) {
                case 'login':
                    return await login(message.email, message.password, message.mfaCode);

                case 'logout':
                    return await logout();

                case 'checkAuth':
                    return await checkAuth();

                case 'savePassword':
                    await savePassword(message.data);
                    return { success: true };

                case 'syncLogin':
                    // Sync credentials from website login
                    await saveAuthData(message.access_token, message.master_password);
                    console.log('Synced login credentials from website');
                    return { success: true };

                default:
                    return { error: 'Unknown action' };
            }
        } catch (error) {
            console.error('Background script error:', error);
            return { error: error.message };
        }
    };

    handleMessage().then(sendResponse);
    return true; // Keep message channel open for async response
});

// Initialize
console.log('SamuraiVault extension loaded');
