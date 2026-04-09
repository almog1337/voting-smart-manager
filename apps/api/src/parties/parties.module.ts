import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { PartiesController } from './parties.controller.js';
import { PartiesService } from './parties.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}
