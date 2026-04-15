import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '../api/candidates';

export const CANDIDATES_KEY = ['candidates'] as const;

export function useCandidates() {
  return useQuery({ queryKey: CANDIDATES_KEY, queryFn: candidatesApi.findAll });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: [...CANDIDATES_KEY, id],
    queryFn: () => candidatesApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: candidatesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: CANDIDATES_KEY }),
  });
}

export function useUpdateCandidate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: unknown) => candidatesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CANDIDATES_KEY }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: candidatesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: CANDIDATES_KEY }),
  });
}
