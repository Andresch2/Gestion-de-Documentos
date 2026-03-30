import apiClient from './client';

export const categoriesApi = {
    getAll: () => apiClient.get('/categories'),

    create: (data: { name: string; color?: string; icon?: string }) =>
        apiClient.post('/categories', data),

    update: (id: string, data: { name?: string; color?: string; icon?: string }) =>
        apiClient.patch(`/categories/${id}`, data),

    delete: (id: string) => apiClient.delete(`/categories/${id}`),
};
