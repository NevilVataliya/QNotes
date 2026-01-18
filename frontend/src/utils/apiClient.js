import conf from '../conf/conf.js';

// Create a standardized API client for making authenticated requests
// with httpOnly cookies
class ApiClient {
    constructor() {
        this.baseURL = conf.backendUrl;
        this.defaultOptions = {
            credentials: 'include', // Always include httpOnly cookies
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type') || '';

            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text };
            }

            if (response.ok) return data;

            const message =
                (data && typeof data === 'object' && data.message && String(data.message).trim())
                    ? String(data.message).slice(0, 500)
                    : `Request failed with status ${response.status}`;

            throw new Error(message);
        } catch (error) {
            console.error('API Client Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: typeof data === 'string' ? data : JSON.stringify(data),
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: typeof data === 'string' ? data : JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * POST request with FormData (for file uploads)
     */
    async postFormData(endpoint, formData, options = {}) {
        const config = {
            ...this.defaultOptions,
            ...options,
            method: 'POST',
            body: formData,
        };
        
        // Remove Content-Type header for FormData (let browser set it)
        delete config.headers['Content-Type'];

        return this.request(endpoint, config);
    }
}

const apiClient = new ApiClient();
export default apiClient;
