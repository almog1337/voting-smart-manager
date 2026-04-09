import * as mongoose from 'mongoose';

// ============================================================
// Sub-document interfaces
// ============================================================

export interface IResidence {
  city: string;
  district?: string;
  geographicPeriphery?: number;
  birthCountry?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IEducation {
  training?: string;
  degree?: string;
  field?: string;
  institution?: string;
}

// ---- Roles (discriminated union) ----

export interface IRoleBase {
  roleType: 'party' | 'military' | 'knesset' | 'public' | 'other';
  title: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  // duration is a virtual: endDate - startDate (or now - startDate if active)
}

export interface IPartyRole extends IRoleBase {
  roleType: 'party';
  partyId: mongoose.Types.ObjectId;
  listPosition?: number;
}

export interface IMilitaryRole extends IRoleBase {
  roleType: 'military';
  rank?: string;
  unit?: string;
}

export interface IKnessetRole extends IRoleBase {
  roleType: 'knesset';
  knessetNum?: number;
}

export interface IPublicRole extends IRoleBase {
  roleType: 'public';
  ministry?: string;
}

export type IRole =
  | IPartyRole
  | IMilitaryRole
  | IKnessetRole
  | IPublicRole;

// ---- Other sub-documents ----

export interface ILink {
  linkType: 'linkedin' | 'wikipedia' | 'knesset' | 'other';
  url: string;
}

export interface ICommittee {
  participationType: 'participation' | 'management' | 'chair';
  committeeId?: mongoose.Types.ObjectId;
  committeeName: string;
}

export interface ITicketVector {
  vectorName: string;
  score: number;
}

export interface ICandidateTicket {
  ticketId: mongoose.Types.ObjectId;
  ticketName: string;
  isPrimary: boolean;
  vectors: ITicketVector[];
}

export interface IImage {
  imageType: 'primary' | 'secondary' | 'mobile' | 'thumbnail';
  url: string;
}

// ============================================================
// Root document interface
// ============================================================

export interface ICandidate {
  name: string;
  birthYear?: number;
  // age: virtual
  gender?: 'male' | 'female' | 'other';
  sector?: 'secular' | 'religious';
  residence: IResidence[];
  orientation?: 'right' | 'left' | 'center';
  languages: string[];
  isCurrentlyServing: boolean;
  education: IEducation[];
  roles: IRole[];
  links: ILink[];
  committees: ICommittee[];
  tickets: ICandidateTicket[]; // computed/cached by scoring job
  images: IImage[];
}

export interface ICandidateVirtuals {
  age: number;
  currentParty: IPartyRole | undefined;
  firstElected: number | undefined;
  seniorityDuration: number | undefined;
}

export type CandidateDocument = mongoose.HydratedDocument<
  ICandidate,
  ICandidateVirtuals
>;

// ============================================================
// Sub-document schemas
// ============================================================

const ResidenceSchema = new mongoose.Schema<IResidence>(
  {
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    geographicPeriphery: { type: Number },
    birthCountry: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false },
);

const EducationSchema = new mongoose.Schema<IEducation>(
  {
    training: { type: String },
    degree: { type: String },
    field: { type: String },
    institution: { type: String },
  },
  { _id: false },
);

// Base role schema — discriminator key is `roleType`
const RoleSchema = new mongoose.Schema<IRoleBase>(
  {
    roleType: {
      type: String,
      enum: ['party', 'military', 'knesset', 'public', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: false },
  },
  { discriminatorKey: 'roleType' },
);

// Party role discriminator
const PartyRoleSchema = new mongoose.Schema<IPartyRole>({
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  listPosition: { type: Number },
});

// Military role discriminator
const MilitaryRoleSchema = new mongoose.Schema<IMilitaryRole>({
  rank: { type: String },
  unit: { type: String },
});

// Knesset role discriminator
const KnessetRoleSchema = new mongoose.Schema<IKnessetRole>({
  knessetNum: { type: Number },
});

// Public role discriminator
const PublicRoleSchema = new mongoose.Schema<IPublicRole>({
  ministry: { type: String },
});

// Other role — no extra fields, uses the base schema only

const LinkSchema = new mongoose.Schema<ILink>(
  {
    linkType: {
      type: String,
      enum: ['linkedin', 'wikipedia', 'knesset', 'other'],
      required: true,
    },
    url: { type: String, required: true },
  },
  { _id: false },
);

const CommitteeSchema = new mongoose.Schema<ICommittee>(
  {
    participationType: {
      type: String,
      enum: ['participation', 'management', 'chair'],
      required: true,
    },
    committeeId: { type: mongoose.Schema.Types.ObjectId },
    committeeName: { type: String, required: true },
  },
  { _id: false },
);

const TicketVectorSchema = new mongoose.Schema<ITicketVector>(
  {
    vectorName: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false },
);

const CandidateTicketSchema = new mongoose.Schema<ICandidateTicket>(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    ticketName: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    vectors: { type: [TicketVectorSchema], default: [] },
  },
  { _id: false },
);

const ImageSchema = new mongoose.Schema<IImage>(
  {
    imageType: {
      type: String,
      enum: ['primary', 'secondary', 'mobile', 'thumbnail'],
      required: true,
    },
    url: { type: String, required: true },
  },
  { _id: false },
);

// ============================================================
// Root schema
// ============================================================

export const CandidateSchema = new mongoose.Schema<
  ICandidate,
  mongoose.Model<ICandidate>,
  ICandidateVirtuals
>(
  {
    name: { type: String, required: true, trim: true },
    birthYear: { type: Number },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    sector: { type: String, enum: ['secular', 'religious'] },
    residence: { type: [ResidenceSchema], default: [] },
    orientation: {
      type: String,
      enum: ['right', 'left', 'center'],
    },
    languages: { type: [String], default: [] },
    isCurrentlyServing: { type: Boolean, default: false },
    education: { type: [EducationSchema], default: [] },
    roles: { type: [RoleSchema], default: [] },
    links: { type: [LinkSchema], default: [] },
    committees: { type: [CommitteeSchema], default: [] },
    tickets: { type: [CandidateTicketSchema], default: [] },
    images: { type: [ImageSchema], default: [] },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// Register role discriminators on the embedded array path
CandidateSchema.path<mongoose.Schema.Types.DocumentArray>('roles').discriminator(
  'party',
  PartyRoleSchema,
);
CandidateSchema.path<mongoose.Schema.Types.DocumentArray>('roles').discriminator(
  'military',
  MilitaryRoleSchema,
);
CandidateSchema.path<mongoose.Schema.Types.DocumentArray>('roles').discriminator(
  'knesset',
  KnessetRoleSchema,
);
CandidateSchema.path<mongoose.Schema.Types.DocumentArray>('roles').discriminator(
  'public',
  PublicRoleSchema,
);

// ============================================================
// Virtuals
// ============================================================

CandidateSchema.virtual('age').get(function (this: CandidateDocument) {
  return new Date().getFullYear() - this.birthYear;
});

CandidateSchema.virtual('currentParty').get(function (this: CandidateDocument) {
  return (this.roles as IRole[]).find(
    (r): r is IPartyRole => r.roleType === 'party' && r.isActive,
  );
});

CandidateSchema.virtual('firstElected').get(function (
  this: CandidateDocument,
) {
  const years = (this.roles as IRole[])
    .filter((r): r is IKnessetRole => r.roleType === 'knesset')
    .map((r) => r.startDate.getFullYear())
    .sort((a, b) => a - b);
  return years[0];
});

CandidateSchema.virtual('seniorityDuration').get(function (
  this: CandidateDocument,
) {
  const first = this.firstElected;
  return first !== undefined ? new Date().getFullYear() - first : undefined;
});

// ============================================================
// Indexes
// ============================================================

CandidateSchema.index({ name: 1 });
CandidateSchema.index({ birthYear: 1 });
CandidateSchema.index({ orientation: 1 });
CandidateSchema.index({ sector: 1 });
CandidateSchema.index({ isCurrentlyServing: 1 });
CandidateSchema.index({ 'residence.district': 1 });
CandidateSchema.index({ 'residence.city': 1 });
CandidateSchema.index({ 'roles.partyId': 1 }); // supports Party virtual populate
CandidateSchema.index({ 'roles.roleType': 1 });
CandidateSchema.index({ 'tickets.ticketId': 1 });
CandidateSchema.index({ 'committees.committeeId': 1 });
CandidateSchema.index({ isCurrentlyServing: 1, 'roles.partyId': 1 });
