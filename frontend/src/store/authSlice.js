import { createSlice } from "@reduxjs/toolkit";
import cookieService from '../utils/cookieService.js';

const initialState = {
    status : false,
    userData: null,
    isLoading: false,
    error: null
}

// Load user data from cookies on initialization
const loadUserDataFromCookies = () => {
    try {
        const savedUserData = cookieService.getUserData();
        if (savedUserData) {
            return savedUserData;
        }
    } catch (error) {
        console.error('Error loading user data from cookies:', error);
    }
    return null;
};

const authSlice = createSlice({
    name: "auth",
    initialState: {
        ...initialState,
        userData: loadUserDataFromCookies(),
        status: !!loadUserDataFromCookies()
    },
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData || action.payload;
            state.error = null;
            // Save to cookies
            cookieService.setUserData(state.userData);
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.error = null;
            // Clear cookies
            cookieService.clearAll();
        },
        setUser: (state, action) => {
            state.userData = action.payload;
            state.status = !!action.payload;
            state.error = null;
            if (action.payload) {
                cookieService.setUserData(action.payload);
            }
        },
        updateUser: (state, action) => {
            if (state.userData) {
                state.userData = { ...state.userData, ...action.payload };
                cookieService.setUserData(state.userData);
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
     }
})

export const {login, logout, setUser, updateUser, setLoading, setError, clearError} = authSlice.actions;

export default authSlice.reducer;