import {configureStore} from '@reduxjs/toolkit';
import authSlice from './authSlice';
import settingsSlice from './settingsSlice';

const store = configureStore({
    reducer: {
        auth : authSlice,
        settings: settingsSlice,
    }
});


export default store;