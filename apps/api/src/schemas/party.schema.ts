import * as mongoose from 'mongoose';

// ---- Root document interface ----

export interface IParty {
  name: string;
  platform?: string;
  isActive: boolean;
}

export type PartyDocument = mongoose.HydratedDocument<IParty>;

// ---- Root schema ----

export const PartySchema = new mongoose.Schema<IParty>(
  {
    name: { type: String, required: true, trim: true },
    platform: { type: String },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// Virtual populate — candidates whose active party role points to this party.
// Wire up after Candidate model is registered (in schema.providers.ts).
PartySchema.virtual('candidates', {
  ref: 'Candidate',
  localField: '_id',
  foreignField: 'roles.partyId',
});

PartySchema.index({ name: 1 });
PartySchema.index({ isActive: 1 });
