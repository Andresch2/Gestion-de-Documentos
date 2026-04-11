import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '/api';
const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
const apiOrigin = normalizedApiBaseUrl.replace(/\/api$/, '');

export function resolveApiUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    if (!path.startsWith('/')) return `${normalizedApiBaseUrl}/${path}`;
    if (path.startsWith('/api/')) return `${apiOrigin}${path}`;
    return `${normalizedApiBaseUrl}${path}`;
}

const apiClient = axios.create({
    baseURL: normalizedApiBaseUrl,
    withCredentials: true,
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, null, {
                    withCredentials: true,
                });
                const newToken = data.data?.accessToken || data.accessToken;
                useAuthStore.getState().setAccessToken(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
