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

export type CandidateRoleType = 'party' | 'military' | 'knesset' | 'public' | 'other';

export type CommitteeParticipationType = 'participation' | 'management' | 'chair';

export interface IIdentifiers {
  committeeName?: string;     // committee, sub_committee
  subCommitteeName?: string;  // sub_committee
  participationType?: CommitteeParticipationType; // committee, sub_committee
  ministryName?: string;      // government_ministry
  roleType?: CandidateRoleType; // role_type
  field?: string;             // education_field
  district?: string;          // residence_district
}

// ---- Root document interface ----

export interface ITicketAttribute {
  tickets: mongoose.Types.ObjectId[];
  type: TicketAttributeType;
  score: number;
  identifiers: IIdentifiers;
  vectorNames: string[];
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
      committeeName: { type: String },
      subCommitteeName: { type: String },
      participationType: { type: String, enum: ['participation', 'management', 'chair'] },
      ministryName: { type: String },
      roleType: { type: String, enum: ['party', 'military', 'knesset', 'public', 'other'] },
      field: { type: String },
      district: { type: String },
    },
    vectorNames: { type: [String], default: [] },
    description: { type: String },
  },
  { timestamps: true },
);

TicketAttributeSchema.index({ type: 1 });
TicketAttributeSchema.index({ tickets: 1 });
