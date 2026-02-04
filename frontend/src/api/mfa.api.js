/**
 * MFA API calls
 */

import { apiClient } from './client';

export const mfaApi = {
    async getStatus() {
        return apiClient.get('/api/mfa/status');
    },

    async setup() {
        return apiClient.post('/api/mfa/setup', {});
    },

    async enable(code, secret) {
        // Add secret to headers for this request
        const headers = { 'X-MFA-Secret': secret };
        return apiClient.request('/api/mfa/enable', {
            method: 'POST',
            headers,
            body: JSON.stringify({ code }),
        });
    },

    async disable(code) {
        return apiClient.post('/api/mfa/disable', { code });
    },
};

export default mfaApi;
