import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseProviders } from './database.providers';
import { SchemaProviders } from './schemas/index.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [...DatabaseProviders, ...SchemaProviders],
})
export class AppModule {}
