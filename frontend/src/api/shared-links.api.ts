import apiClient from './client';

export const sharedLinksApi = {
    getAll: () => apiClient.get('/shared-links'),

    create: (data: { documentId: string; expiresIn?: string; isOneTime?: boolean }) =>
        apiClient.post('/shared-links', data),

    delete: (id: string) => apiClient.delete(`/shared-links/${id}`),

    access: (token: string) => apiClient.get(`/shared-links/access/${token}`),
};
