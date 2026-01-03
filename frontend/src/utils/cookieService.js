/**
 * Cookie utility service for secure cookie management
 * Replaces localStorage usage throughout the application
 */

class CookieService {
    constructor() {
        this.defaultOptions = {
            secure: true,
            sameSite: 'lax',
            path: '/',
            httpOnly: false, // Can't set httpOnly from client-side
        };
        console.warn('Note: Authentication tokens are now httpOnly cookies set by the server and cannot be accessed via JavaScript');
    }

    /**
     * Set a cookie with proper security options
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {Object} options - Additional cookie options
     */
    setCookie(name, value, options = {}) {
        const opts = { ...this.defaultOptions, ...options };

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        // Add expiration
        if (opts.expires) {
            if (opts.expires instanceof Date) {
                cookieString += `; expires=${opts.expires.toUTCString()}`;
            } else if (typeof opts.expires === 'number') {
                // Number of days
                const date = new Date();
                date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
                cookieString += `; expires=${date.toUTCString()}`;
            }
        }

        // Add max-age for session tokens (more secure than expires)
        if (opts.maxAge) {
            cookieString += `; max-age=${opts.maxAge}`;
        }

        // Add path
        if (opts.path) {
            cookieString += `; path=${opts.path}`;
        }

        // Add domain (optional)
        if (opts.domain) {
            cookieString += `; domain=${opts.domain}`;
        }

        // Add secure flag
        if (opts.secure) {
            cookieString += '; secure';
        }

        // Add sameSite
        if (opts.sameSite) {
            cookieString += `; samesite=${opts.sameSite}`;
        }

        document.cookie = cookieString;
    }

    /**
     * Get a cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null if not found
     */
    getCookie(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }

    /**
     * Remove a cookie
     * @param {string} name - Cookie name
     * @param {Object} options - Cookie options for removal
     */
    removeCookie(name, options = {}) {
        const opts = { ...this.defaultOptions, ...options, expires: new Date(0) };
        this.setCookie(name, '', opts);
    }

    /**
     * Note: This method is deprecated as tokens are now httpOnly cookies set by server
     * @param {string} token - Access token
     * @param {number} expiresIn - Expiration time in seconds (default: 15 minutes)
     */
    setAccessToken(token, expiresIn = 900) { // 15 minutes default
        console.warn('setAccessToken: Authentication tokens are now httpOnly cookies managed by the server. This method should not be used.');
        // Keeping for backwards compatibility but not actually setting anything
    }

    /**
     * Note: This method is deprecated as tokens are now httpOnly cookies
     * @returns {string|null} - Always returns null for httpOnly cookies
     */
    getAccessToken() {
        console.warn('getAccessToken: Authentication tokens are now httpOnly cookies and cannot be accessed via JavaScript');
        return null; // httpOnly cookies cannot be accessed via JavaScript
    }

    /**
     * Remove access token
     */
    removeAccessToken() {
        this.removeCookie('accessToken');
    }

    /**
     * Note: This method is deprecated as tokens are now httpOnly cookies set by server
     * @param {string} token - Refresh token
     * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
     */
    setRefreshToken(token, expiresIn = 604800) { // 7 days default
        console.warn('setRefreshToken: Authentication tokens are now httpOnly cookies managed by the server. This method should not be used.');
        // Keeping for backwards compatibility but not actually setting anything
    }

    /**
     * Note: This method is deprecated as tokens are now httpOnly cookies
     * @returns {string|null} - Always returns null for httpOnly cookies
     */
    getRefreshToken() {
        console.warn('getRefreshToken: Authentication tokens are now httpOnly cookies and cannot be accessed via JavaScript');
        return null; // httpOnly cookies cannot be accessed via JavaScript
    }

    /**
     * Remove refresh token
     */
    removeRefreshToken() {
        this.removeCookie('refreshToken');
    }

    /**
     * Set user data
     * @param {Object} userData - User data object
     * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
     */
    setUserData(userData, expiresIn = 604800) { // 7 days default
        const userDataString = JSON.stringify(userData);
        this.setCookie('userData', userDataString, {
            maxAge: expiresIn,
            secure: true,
            sameSite: 'lax'
        });
    }

    /**
     * Get user data
     * @returns {Object|null} - User data object or null
     */
    getUserData() {
        const userDataString = this.getCookie('userData');
        if (userDataString) {
            try {
                return JSON.parse(userDataString);
            } catch (error) {
                console.error('Error parsing user data from cookie:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Remove user data
     */
    removeUserData() {
        this.removeCookie('userData');
    }

    /**
     * Set application settings
     * @param {Object} settings - Settings object
     * @param {number} expiresIn - Expiration time in seconds (default: 30 days)
     */
    setSettings(settings, expiresIn = 2592000) { // 30 days default
        const settingsString = JSON.stringify(settings);
        this.setCookie('appSettings', settingsString, {
            maxAge: expiresIn,
            secure: true,
            sameSite: 'lax'
        });
    }

    /**
     * Get application settings
     * @returns {Object|null} - Settings object or null
     */
    getSettings() {
        const settingsString = this.getCookie('appSettings');
        if (settingsString) {
            try {
                return JSON.parse(settingsString);
            } catch (error) {
                console.error('Error parsing settings from cookie:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Remove application settings
     */
    removeSettings() {
        this.removeCookie('appSettings');
    }

    /**
     * Clear all application cookies
     */
    clearAll() {
        this.removeAccessToken();
        this.removeRefreshToken();
        this.removeUserData();
        this.removeSettings();
    }

    /**
     * Check if cookies are enabled
     * @returns {boolean} - True if cookies are enabled
     */
    areCookiesEnabled() {
        try {
            this.setCookie('testCookie', 'test', { maxAge: 1 });
            const testCookie = this.getCookie('testCookie');
            this.removeCookie('testCookie');
            return testCookie === 'test';
        } catch (error) {
            return false;
        }
    }
}

const cookieService = new CookieService();
export default cookieService;
