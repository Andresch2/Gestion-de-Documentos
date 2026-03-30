import apiClient from './client';

export const notificationsApi = {
    getAll: (page?: number, limit?: number) =>
        apiClient.get('/notifications', { params: { page, limit } }),

    readAll: () => apiClient.patch('/notifications/read-all'),

    read: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};

export const usersApi = {
    getMe: () => apiClient.get('/users/me'),

    updateMe: (data: { name?: string; email?: string }) =>
        apiClient.patch('/users/me', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.patch('/users/me/password', data),

    exportData: () =>
        apiClient.get('/users/me/export', { responseType: 'blob' }),
};
