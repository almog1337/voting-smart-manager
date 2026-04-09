import { Module } from '@nestjs/common';
import { DatabaseProviders } from '../database.providers.js';
import { SchemaProviders } from '../schemas/index.js';

@Module({
  providers: [...DatabaseProviders, ...SchemaProviders],
  exports: [...DatabaseProviders, ...SchemaProviders],
})
export class DatabaseModule {}
