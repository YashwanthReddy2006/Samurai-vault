/**
 * Vault API calls
 */

import { apiClient } from './client';

export const vaultApi = {
    async list() {
        return apiClient.get('/api/vault/list');
    },

    async get(entryId) {
        return apiClient.get(`/api/vault/${entryId}`);
    },

    async add(entry) {
        return apiClient.post('/api/vault/add', entry);
    },

    async update(entryId, entry) {
        return apiClient.put(`/api/vault/${entryId}`, entry);
    },

    async delete(entryId) {
        return apiClient.delete(`/api/vault/${entryId}`);
    },

    async checkStrength(password) {
        return apiClient.post('/api/vault/check-strength', { password });
    },

    async checkBreach(password) {
        return apiClient.post('/api/vault/check-breach', { password });
    },
};

export default vaultApi;
