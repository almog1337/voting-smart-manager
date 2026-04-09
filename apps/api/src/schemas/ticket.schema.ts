import * as mongoose from 'mongoose';

// ---- Sub-document interfaces ----

export interface IVector {
  _id: mongoose.Types.ObjectId;
  name: string;
  orientation: 'right' | 'left';
}

// ---- Root document interface ----

export interface ITicket {
  name: string;
  threshold: number;
  vectors: IVector[];
}

export type TicketDocument = mongoose.HydratedDocument<ITicket>;

// ---- Sub-document schemas ----

const VectorSchema = new mongoose.Schema<IVector>({
  name: { type: String, required: true, trim: true },
  orientation: { type: String, enum: ['right', 'left'], required: true },
});

// ---- Root schema ----

export const TicketSchema = new mongoose.Schema<ITicket>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    threshold: { type: Number, required: true, default: 0 },
    vectors: { type: [VectorSchema], default: [] },
  },
  { timestamps: true },
);
