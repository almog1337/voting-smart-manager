import { apiClient } from './client';

export interface ScoringJobResult {
  processedAt: string;
  candidatesProcessed: number;
  candidatesUpdated: number;
  durationMs: number;
  errors: { candidateId: string; message: string }[];
}

export const scoringJobsApi = {
  run: () =>
    apiClient.post<ScoringJobResult>('/scoring-jobs/run').then((r) => r.data),
};
