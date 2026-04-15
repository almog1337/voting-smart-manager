import { apiClient } from './client';
import type { Ticket } from '../types';

export const ticketsApi = {
  findAll: () => apiClient.get<Ticket[]>('/tickets').then((r) => r.data),
  findOne: (id: string) => apiClient.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post<Ticket>('/tickets', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch<Ticket>(`/tickets/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/tickets/${id}`),
};
