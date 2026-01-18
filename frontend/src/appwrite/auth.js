import conf from '../conf/conf.js';
import cookieService from '../utils/cookieService.js';

const debugLog = (...args) => {
    if (import.meta?.env?.DEV) {
        console.debug(...args);
    }
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    return { message: text };
};

const getErrorMessage = (data, response) => {
    if (data && typeof data === 'object' && data.message) {
        return String(data.message).slice(0, 500);
    }
    return `Request failed with status ${response.status}`;
};

export class AuthService {

    async createAccount({email, password, fullname, username, avatar, coverImage}) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('fullname', fullname);
        formData.append('password', password);

        if (avatar) {
            formData.append('avatar', avatar);
        }
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        const response = await fetch(`${conf.backendUrl}/api/v1/user/register`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            // If not successful, parse the error from the response body
            // Your backend sends a JSON object with 'message', 'success', etc.
            const errorData = await response.json();
            console.error("Backend Error:", errorData.message); // Log the specific error
            throw new Error(errorData.message); // Re-throw the error with the message
        }

        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    }

    async login({email, username, password}) {
        if (!conf.backendUrl) {
            throw new Error('Missing VITE_BACKEND_URL (frontend cannot reach backend)');
        }

        const loginData = email ? { email, password } : { username, password };
        const url = `${conf.backendUrl}/api/v1/user/login`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important: include cookies in request
                body: JSON.stringify(loginData),
            });

            const contentType = response.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = text ? { message: text } : null;
            }

            if (response.ok) {
                return data;
            }

            throw new Error(
                data?.message || `Login failed (HTTP ${response.status}${response.statusText ? `: ${response.statusText}` : ''})`
            );
        } catch (error) {
            // This is the typical path for `net::ERR_EMPTY_RESPONSE` / connection resets.
            // Fetch errors are often TypeError("Failed to fetch") but can vary by browser.
            const message = error?.message || String(error);
            throw new Error(
                `Login request failed (no response from backend). Backend may have crashed or closed the connection. URL=${url}. Details: ${message}`
            );
        }
    }

    async getCurrentUser() {
        try {
            debugLog('getCurrentUser: making request with httpOnly cookies');
            const response = await fetch(`${conf.backendUrl}/api/v1/user/get-user`, {
                method: 'GET',
                credentials: 'include', // Include httpOnly cookies
            });
            
            debugLog('getCurrentUser: response status', response.status);
            const data = await response.json();
            
            if (response.ok) {
                debugLog('getCurrentUser: success');
                return data.data;
            } else {
                debugLog('getCurrentUser: error response', data);
                // If unauthorized, try refresh token only once
                if (response.status === 401) {
                    debugLog('getCurrentUser: trying refresh token');
                    try {
                        await this.refreshAccessToken();
                        // After refresh, retry the getCurrentUser request
                        const retryResponse = await fetch(`${conf.backendUrl}/api/v1/user/get-user`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                        const retryData = await retryResponse.json();
                        if (retryResponse.ok) {
                            debugLog('getCurrentUser: success after refresh');
                            return retryData.data;
                        }
                    } catch (refreshError) {
                        debugLog('getCurrentUser: refresh failed', refreshError?.message);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('AuthService :: getCurrentUser :: error', error);
            return null;
        }
    }

    async logout() {
        try {
            await fetch(`${conf.backendUrl}/api/v1/user/logout`, {
                method: 'POST',
                credentials: 'include', // Send httpOnly cookies
            });
            // Server will clear the httpOnly cookies
            // Clear any client-side cookies if they exist
            cookieService.clearAll();
        } catch (error) {
            console.error('AuthService :: logout :: error', error);
        }
    }

    async refreshAccessToken() {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/user/refresh-access-token`, {
                method: 'POST',
                credentials: 'include', // Include httpOnly cookies
            });

            const data = await response.json();
            if (response.ok) {
                // Server will set new httpOnly cookies automatically
                return data.data?.accessToken; // Return for potential logging, but don't store client-side
            } else {
                throw new Error('Refresh failed');
            }
        } catch (error) {
            // Clear any client-side cookies on refresh failure
            cookieService.clearAll();
            throw error;
        }
    }

    async changePassword({oldPassword, newPassword, confirmPassword}) {
        const response = await fetch(`${conf.backendUrl}/api/v1/user/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include httpOnly cookies
            body: JSON.stringify({oldPassword, newPassword, confirmPassword}),
        });
        const data = await parseResponse(response);
        if (response.ok) return data;
        throw new Error(getErrorMessage(data, response) || 'Change password failed');
    }

    async initiateForgotPassword(email) {
        const response = await fetch(`${conf.backendUrl}/api/v1/user/initiate-forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email}),
        });
        const data = await parseResponse(response);
        if (response.ok) return data;
        throw new Error(getErrorMessage(data, response) || 'Initiate forgot password failed');
    }

    async forgotPassword({email, otp, newPassword, token}) {
        let url = `${conf.backendUrl}/api/v1/user/forgot-password`;
        let body;

        if (token) {
            // Use token from query params
            url += `?token=${encodeURIComponent(token)}`;
            body = { newPassword };
        } else {
            // Use email and OTP
            body = { email, otp, newPassword };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await parseResponse(response);
        if (response.ok) return data;
        throw new Error(getErrorMessage(data, response) || 'Forgot password failed');
    }

    async updateAccount({fullname}) {
        const accessToken = cookieService.getAccessToken();
        const response = await fetch(`${conf.backendUrl}/api/v1/user/update-account`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({fullname}),
        });
        const data = await response.json();
        if (response.ok) {
            return data.data;
        } else {
            throw new Error(data.message || 'Update account failed');
        }
    }

    async updateAvatar(avatarFile) {
        const accessToken = cookieService.getAccessToken();
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const response = await fetch(`${conf.backendUrl}/api/v1/user/update-avatar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });
        const data = await response.json();
        if (response.ok) {
            return data.data;
        } else {
            throw new Error(data.message || 'Update avatar failed');
        }
    }

    async updateCoverImage(coverFile) {
        const accessToken = cookieService.getAccessToken();
        const formData = new FormData();
        formData.append('coverImage', coverFile);
        const response = await fetch(`${conf.backendUrl}/api/v1/user/update-coverimage`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });
        const data = await response.json();
        if (response.ok) {
            return data.data;
        } else {
            throw new Error(data.message || 'Update cover image failed');
        }
    }

    async verifyEmail({email, otp, token}) {
        let body;
        if (token) {
            // Use token from query params
            const response = await fetch(`${conf.backendUrl}/api/v1/user/verify-email?token=${token}`, {
                method: 'POST',
                credentials: 'include', // Include httpOnly cookies
            });
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Email verification failed');
            }
        } else {
            // Use email and OTP
            body = { email, otp };
            const response = await fetch(`${conf.backendUrl}/api/v1/user/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include httpOnly cookies
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Email verification failed');
            }
        }
    }

    async resendVerificationEmail({email}) {
        const response = await fetch(`${conf.backendUrl}/api/v1/user/resend-verification-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email}),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Resend verification email failed');
        }
    }

    async removeAvatar() {
        const accessToken = cookieService.getAccessToken();
        const response = await fetch(`${conf.backendUrl}/api/v1/user/delete-avatar`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Remove avatar failed');
        }
    }

    async removeCoverImage() {
        const accessToken = cookieService.getAccessToken();
        const response = await fetch(`${conf.backendUrl}/api/v1/user/delete-coverimage`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Remove cover image failed');
        }
    }

    async getWatchHistory() {
        const accessToken = cookieService.getAccessToken();
        const response = await fetch(`${conf.backendUrl}/api/v1/user/watch-history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            return data.data;
        } else {
            throw new Error(data.message || 'Get watch history failed');
        }
    }
}

const authService = new AuthService();

export default authService;


