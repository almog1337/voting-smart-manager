import * as mongoose from 'mongoose';

// ---- Types ----

export type TicketAttributeType =
  | 'committee'
  | 'sub_committee'
  | 'government_ministry'
  | 'role_type'
  | 'education_field'
  | 'residence_district';
// TODO: extend this union as new scoring rule types are defined

// ---- Root document interface ----

export interface ITicketAttribute {
  tickets: mongoose.Types.ObjectId[];
  type: TicketAttributeType;
  score: number;
  identifiers: Map<string, string>;
  description?: string;
}

export type TicketAttributeDocument = mongoose.HydratedDocument<ITicketAttribute>;

// ---- Root schema ----

export const TicketAttributeSchema = new mongoose.Schema<ITicketAttribute>(
  {
    tickets: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
      required: true,
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length > 0,
        message: 'TicketAttribute must reference at least one ticket',
      },
    },
    type: {
      type: String,
      enum: [
        'committee',
        'sub_committee',
        'government_ministry',
        'role_type',
        'education_field',
        'residence_district',
      ],
      required: true,
    },
    score: { type: Number, required: true },
    identifiers: {
      type: Map,
      of: String,
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true },
);

TicketAttributeSchema.index({ type: 1 });
TicketAttributeSchema.index({ tickets: 1 });
// Wildcard index covers all dynamic Map keys (e.g. identifiers.committeeName)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
TicketAttributeSchema.index({ 'identifiers.$**': 1 } as any);
