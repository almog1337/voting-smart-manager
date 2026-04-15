import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';

export const TICKETS_KEY = ['tickets'] as const;

export function useTickets() {
  return useQuery({ queryKey: TICKETS_KEY, queryFn: ticketsApi.findAll });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: [...TICKETS_KEY, id],
    queryFn: () => ticketsApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: unknown) => ticketsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}
