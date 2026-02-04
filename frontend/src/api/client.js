/**
 * API Client - Fetch wrapper with auth headers
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('access_token');
    }

    getMasterPassword() {
        return sessionStorage.getItem('master_password');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add auth token
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Add master password for vault AND analytics operations
        const masterPassword = this.getMasterPassword();
        if (masterPassword && (endpoint.includes('/vault') || endpoint.includes('/analytics'))) {
            headers['X-Master-Password'] = masterPassword;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 - redirect to login
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                sessionStorage.removeItem('master_password');
                window.location.href = '/login';
                return null;
            }

            // Handle 204 No Content (for delete operations)
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export default apiClient;

