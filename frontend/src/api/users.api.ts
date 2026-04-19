import apiClient from './client';

export const usersApi = {
    getMe: () => apiClient.get('/users/me'),

    updateMe: (data: { name?: string; email?: string }) =>
        apiClient.patch('/users/me', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.patch('/users/me/password', data),

    exportData: () =>
        apiClient.get('/users/me/export', { responseType: 'blob' }),

    deleteMe: () => apiClient.delete('/users/me'),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
