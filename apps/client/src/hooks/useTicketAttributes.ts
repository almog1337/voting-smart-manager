import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketAttributesApi } from '../api/ticketAttributes';

export const TICKET_ATTRIBUTES_KEY = ['ticket-attributes'] as const;

export function useTicketAttributes() {
  return useQuery({ queryKey: TICKET_ATTRIBUTES_KEY, queryFn: ticketAttributesApi.findAll });
}

export function useTicketAttribute(id: string) {
  return useQuery({
    queryKey: [...TICKET_ATTRIBUTES_KEY, id],
    queryFn: () => ticketAttributesApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateTicketAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketAttributesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKET_ATTRIBUTES_KEY }),
  });
}

export function useUpdateTicketAttribute(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: unknown) => ticketAttributesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKET_ATTRIBUTES_KEY }),
  });
}

export function useDeleteTicketAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketAttributesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: TICKET_ATTRIBUTES_KEY }),
  });
}
