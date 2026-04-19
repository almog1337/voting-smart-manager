import { useMutation } from '@tanstack/react-query';
import { scoringJobsApi } from '../api/scoringJobs';

export function useRunScoringJob() {
  return useMutation({ mutationFn: scoringJobsApi.run });
}
