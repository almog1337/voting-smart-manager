import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

export const DatabaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (configService: ConfigService): Promise<typeof mongoose> => {
      const mongoUri = configService.get<string>('MONGO_URI');
      if (!mongoUri) {
        throw new Error('Missing MONGO_URI environment variable');
      }
      return mongoose.connect(mongoUri);
    },
    inject: [ConfigService],
  },
];
