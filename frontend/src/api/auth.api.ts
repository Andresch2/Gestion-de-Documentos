import apiClient from './client';

export const authApi = {
    register: (data: { email: string; password: string; name: string }) =>
        apiClient.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        apiClient.post('/auth/login', data),

    refresh: () => apiClient.post('/auth/refresh'),

    logout: () => apiClient.post('/auth/logout'),
};
