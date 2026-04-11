import apiClient from './client';

export const usersApi = {
    getMe: () => apiClient.get('/users/me'),

    updateMe: (data: { name?: string; email?: string }) =>
        apiClient.patch('/users/me', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.patch('/users/me/password', data),

    exportData: () =>
        apiClient.get('/users/me/export', { responseType: 'blob' }),
};
