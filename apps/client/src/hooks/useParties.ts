import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partiesApi } from '../api/parties';

export const PARTIES_KEY = ['parties'] as const;

export function useParties() {
  return useQuery({ queryKey: PARTIES_KEY, queryFn: partiesApi.findAll });
}

export function useParty(id: string) {
  return useQuery({
    queryKey: [...PARTIES_KEY, id],
    queryFn: () => partiesApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: partiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  });
}

export function useUpdateParty(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: unknown) => partiesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  });
}

export function useDeleteParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: partiesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  });
}
