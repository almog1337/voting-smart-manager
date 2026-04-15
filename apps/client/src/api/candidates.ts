import { apiClient } from './client';
import type { Candidate } from '../types';

export const candidatesApi = {
  findAll: () => apiClient.get<Candidate[]>('/candidates').then((r) => r.data),
  findOne: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post<Candidate>('/candidates', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch<Candidate>(`/candidates/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/candidates/${id}`),
};
