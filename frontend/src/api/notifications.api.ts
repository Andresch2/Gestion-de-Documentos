import apiClient from './client';

export const notificationsApi = {
    getAll: (page?: number, limit?: number) =>
        apiClient.get('/notifications', { params: { page, limit } }),

    readAll: () => apiClient.patch('/notifications/read-all'),

    read: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};
