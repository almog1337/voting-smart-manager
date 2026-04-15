export interface Residence {
  city: string;
  district?: string;
  geographicPeriphery?: number;
  birthCountry?: string;
  startDate?: string;
  endDate?: string;
}

export interface Education {
  training?: string;
  degree?: string;
  field?: string;
  institution?: string;
}

export type RoleType = 'party' | 'military' | 'knesset' | 'public' | 'other';

export interface RoleBase {
  roleType: RoleType;
  title: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface PartyRole extends RoleBase {
  roleType: 'party';
  partyId: string;
  listPosition?: number;
}

export interface MilitaryRole extends RoleBase {
  roleType: 'military';
  rank?: string;
  unit?: string;
}

export interface KnessetRole extends RoleBase {
  roleType: 'knesset';
  knessetNum?: number;
}

export interface PublicRole extends RoleBase {
  roleType: 'public';
  ministry?: string;
}

export interface OtherRole extends RoleBase {
  roleType: 'other';
}

export type AnyRole = PartyRole | MilitaryRole | KnessetRole | PublicRole | OtherRole;

export interface Link {
  linkType: 'linkedin' | 'wikipedia' | 'knesset' | 'other';
  url: string;
}

export interface Committee {
  participationType: 'participation' | 'management' | 'chair';
  committeeId?: string;
  committeeName: string;
}

export interface TicketVector {
  vectorName: string;
  score: number;
}

export interface CandidateTicket {
  ticketId: string;
  ticketName: string;
  isPrimary: boolean;
  vectors: TicketVector[];
}

export interface Image {
  imageType: 'primary' | 'secondary' | 'mobile' | 'thumbnail';
  url: string;
}

export interface Candidate {
  _id: string;
  name: string;
  birthYear?: number;
  gender?: 'male' | 'female' | 'other';
  sector?: 'secular' | 'religious';
  orientation?: 'right' | 'left' | 'center';
  languages: string[];
  isCurrentlyServing: boolean;
  residence: Residence[];
  education: Education[];
  roles: AnyRole[];
  links: Link[];
  committees: Committee[];
  tickets: CandidateTicket[];
  images: Image[];
  // virtuals
  age?: number;
  currentParty?: PartyRole;
  firstElected?: number;
  seniorityDuration?: number;
}

export interface Party {
  _id: string;
  name: string;
  platform?: string;
  isActive: boolean;
  candidates?: Candidate[];
}

export interface Vector {
  _id?: string;
  name: string;
  orientation: 'right' | 'left';
}

export interface Ticket {
  _id: string;
  name: string;
  threshold: number;
  vectors: Vector[];
}

export type TicketAttributeType =
  | 'committee'
  | 'sub_committee'
  | 'government_ministry'
  | 'role_type'
  | 'education_field'
  | 'residence_district';

export type CommitteeParticipationType = 'participation' | 'management' | 'chair';

export interface TicketAttributeIdentifiers {
  committeeName?: string;     // committee, sub_committee
  subCommitteeName?: string;  // sub_committee
  participationType?: CommitteeParticipationType; // committee, sub_committee
  ministryName?: string;      // government_ministry
  roleType?: RoleType;        // role_type
  field?: string;             // education_field
  district?: string;          // residence_district
}

export interface TicketAttribute {
  _id: string;
  tickets: string[];
  type: TicketAttributeType;
  score: number;
  identifiers: TicketAttributeIdentifiers;
  vectorNames: string[];
  description?: string;
}
