import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module.js';
import { PartiesModule } from './parties/parties.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { TicketAttributesModule } from './ticket-attributes/ticket-attributes.module.js';
import { CandidatesModule } from './candidates/candidates.module.js';
import { ScoringJobsModule } from './scoring-jobs/scoring-jobs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PartiesModule,
    TicketsModule,
    TicketAttributesModule,
    CandidatesModule,
    ScoringJobsModule,
  ],
})
export class AppModule {}
