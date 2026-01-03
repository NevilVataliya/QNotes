import { createSlice } from "@reduxjs/toolkit";
import cookieService from '../utils/cookieService.js';

const initialState = {
    settings: {
        // General Settings
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',

        // Privacy Settings
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowMessages: true,
        showActivity: false,

        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        noteUpdates: true,
        followerUpdates: true,
        marketingEmails: false,

        // Account Settings
        twoFactorAuth: false,
        sessionTimeout: '30',
        dataExport: false
    },
    loading: false,
    error: null
}

// Load settings from cookies on initialization
const loadSettingsFromCookies = () => {
    try {
        const savedSettings = cookieService.getSettings();
        if (savedSettings) {
            const settings = { ...initialState.settings, ...savedSettings };
            // Apply theme to DOM immediately
            if (settings.theme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
            return settings;
        }
    } catch (error) {
        console.error('Error loading settings from cookies:', error);
    }
    return initialState.settings;
};

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        ...initialState,
        settings: loadSettingsFromCookies()
    },
    reducers: {
        setSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
            // Save to cookies
            cookieService.setSettings(state.settings);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateSetting: (state, action) => {
            const { key, value } = action.payload;
            state.settings[key] = value;
            // Save to cookies
            cookieService.setSettings(state.settings);
        },
        loadSettings: (state) => {
            const savedSettings = cookieService.getSettings();
            if (savedSettings) {
                state.settings = { ...state.settings, ...savedSettings };
            }
        }
    }
})

export const { setSettings, setLoading, setError, clearError, updateSetting, loadSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
