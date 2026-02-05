/**
 * Auth API calls
 */

import { apiClient } from './client';

export const authApi = {
    async register(email, username, masterPassword) {
        return apiClient.post('/api/auth/register', {
            email,
            username,
            master_password: masterPassword,
        });
    },

    async login(email, masterPassword, mfaCode = null) {
        const response = await apiClient.post('/api/auth/login', {
            email,
            master_password: masterPassword,
            mfa_code: mfaCode,
        });

        if (response && response.access_token) {
            localStorage.setItem('access_token', response.access_token);
            // Store master password in session for vault encryption
            sessionStorage.setItem('master_password', masterPassword);

            // Sync to Chrome extension if available
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    // Try to send to extension - extension ID will be different in production
                    // This uses the externally_connectable feature
                    window.postMessage({
                        type: 'SAMURAI_VAULT_LOGIN',
                        access_token: response.access_token,
                        master_password: masterPassword
                    }, '*');
                }
            } catch (e) {
                console.log('Extension sync not available');
            }
        }

        return response;
    },

    async logout() {
        try {
            await apiClient.post('/api/auth/logout', {});
        } finally {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('master_password');
        }
    },

    async getMe() {
        return apiClient.get('/api/auth/me');
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },
};

export default authApi;
