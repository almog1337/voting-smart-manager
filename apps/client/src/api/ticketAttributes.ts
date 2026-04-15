import { apiClient } from './client';
import type { TicketAttribute } from '../types';

export const ticketAttributesApi = {
  findAll: () => apiClient.get<TicketAttribute[]>('/ticket-attributes').then((r) => r.data),
  findOne: (id: string) =>
    apiClient.get<TicketAttribute>(`/ticket-attributes/${id}`).then((r) => r.data),
  create: (dto: unknown) =>
    apiClient.post<TicketAttribute>('/ticket-attributes', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch<TicketAttribute>(`/ticket-attributes/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/ticket-attributes/${id}`),
};
