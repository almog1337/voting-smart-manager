import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScoringJobResult, ScoringJobsService } from './scoring-jobs.service.js';

@ApiTags('scoring-jobs')
@Controller('scoring-jobs')
export class ScoringJobsController {
  constructor(private readonly scoringJobsService: ScoringJobsService) {}

  @Post('run')
  @ApiOperation({ summary: 'Trigger the ticket scoring job manually' })
  @ApiOkResponse({ description: 'Returns job execution stats' })
  async run(): Promise<ScoringJobResult> {
    return this.scoringJobsService.runScoringJob();
  }
}
