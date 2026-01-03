import conf from "../conf/conf.js";

const API_BASE_URL = `${conf.backendUrl}/api/v1/clap`;

class ClapService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async getClaps(noteId) {
        try {
            const response = await fetch(`${this.baseURL}/get-claps/${noteId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get claps: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('Error getting claps:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async incrementClap(noteId) {
        try {
            const response = await fetch(`${this.baseURL}/increment/${noteId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to increment clap: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('Error incrementing clap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async decrementClap(noteId) {
        try {
            const response = await fetch(`${this.baseURL}/decrement/${noteId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to decrement clap: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('Error decrementing clap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const clapService = new ClapService();
export default clapService;