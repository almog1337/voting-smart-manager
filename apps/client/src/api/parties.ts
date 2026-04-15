import { apiClient } from './client';
import type { Party } from '../types';

export const partiesApi = {
  findAll: () => apiClient.get<Party[]>('/parties').then((r) => r.data),
  findOne: (id: string) => apiClient.get<Party>(`/parties/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post<Party>('/parties', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch<Party>(`/parties/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/parties/${id}`),
};
