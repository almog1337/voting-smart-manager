import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { PartiesModule } from './parties/parties.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { TicketAttributesModule } from './ticket-attributes/ticket-attributes.module.js';
import { CandidatesModule } from './candidates/candidates.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PartiesModule,
    TicketsModule,
    TicketAttributesModule,
    CandidatesModule,
  ],
})
export class AppModule {}
