import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ScoringJobsController } from './scoring-jobs.controller.js';
import { ScoringJobsService } from './scoring-jobs.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ScoringJobsController],
  providers: [ScoringJobsService],
  exports: [ScoringJobsService],
})
export class ScoringJobsModule {}
