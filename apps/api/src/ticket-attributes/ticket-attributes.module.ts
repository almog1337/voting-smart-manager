import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { TicketAttributesController } from './ticket-attributes.controller.js';
import { TicketAttributesService } from './ticket-attributes.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [TicketAttributesController],
  providers: [TicketAttributesService],
})
export class TicketAttributesModule {}
