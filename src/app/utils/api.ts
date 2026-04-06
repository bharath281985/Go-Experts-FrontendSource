import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const responseData = error.response?.data;
        const status = error.response?.status;

        // Handle session expiration
        if (status === 401) {
            // Check if we should skip the global redirect for this request
            if (error.config?.skipAuthRedirect) {
                return Promise.reject(error);
            }

            // Don't toast for login attempts, only for protected routes
            if (!error.config.url?.includes('/auth/login')) {
                // localStorage.clear(); // Removing this as it's too aggressive for guest checks
                window.location.href = '/signin';
            }
        }

        // Show detailed validation errors if present
        if (responseData?.errors && Array.isArray(responseData.errors)) {
            if (!error.config?.skipToast) {
                responseData.errors.forEach((err: any) => {
                    toast.error(`${err.path}: ${err.message}`);
                });
            }
        } else {
            // Show general error message
            if (!error.config?.skipToast) {
                const message = responseData?.message || error.message || 'An unexpected error occurred';
                toast.error(message);
            }
        }

        return Promise.reject(error);
    }
);

export const getImgUrl = (path: string | undefined): string => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export default api;
