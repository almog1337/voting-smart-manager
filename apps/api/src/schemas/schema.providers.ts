import * as mongoose from 'mongoose';
import { CandidateSchema } from './candidate.schema.js';
import { PartySchema } from './party.schema.js';
import { TicketSchema } from './ticket.schema.js';
import { TicketAttributeSchema } from './ticket-attribute.schema.js';

export const MODEL_CANDIDATE = 'CANDIDATE_MODEL';
export const MODEL_PARTY = 'PARTY_MODEL';
export const MODEL_TICKET = 'TICKET_MODEL';
export const MODEL_TICKET_ATTRIBUTE = 'TICKET_ATTRIBUTE_MODEL';

export const SchemaProviders = [
  {
    provide: MODEL_TICKET,
    useFactory: (mongooseInstance: typeof mongoose) =>
      mongooseInstance.connection.model('Ticket', TicketSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: MODEL_PARTY,
    useFactory: (mongooseInstance: typeof mongoose) =>
      mongooseInstance.connection.model('Party', PartySchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: MODEL_TICKET_ATTRIBUTE,
    useFactory: (mongooseInstance: typeof mongoose) =>
      mongooseInstance.connection.model(
        'TicketAttribute',
        TicketAttributeSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: MODEL_CANDIDATE,
    useFactory: (mongooseInstance: typeof mongoose) =>
      mongooseInstance.connection.model('Candidate', CandidateSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
