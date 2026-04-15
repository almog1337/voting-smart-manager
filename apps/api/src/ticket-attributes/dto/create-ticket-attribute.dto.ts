import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsMongoId,
  ArrayUnique,
  ValidateNested,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

const TICKET_ATTRIBUTE_TYPES = [
  'committee',
  'sub_committee',
  'government_ministry',
  'role_type',
  'education_field',
  'residence_district',
] as const;

const CANDIDATE_ROLE_TYPES = ['party', 'military', 'knesset', 'public', 'other'] as const;
const COMMITTEE_PARTICIPATION_TYPES = ['participation', 'management', 'chair'] as const;

export type TicketAttributeType = (typeof TICKET_ATTRIBUTE_TYPES)[number];

export class IdentifiersDto {
  @IsOptional()
  @IsString()
  committeeName?: string;

  @IsOptional()
  @IsString()
  subCommitteeName?: string;

  @IsOptional()
  @IsIn(COMMITTEE_PARTICIPATION_TYPES)
  participationType?: string;

  @IsOptional()
  @IsString()
  ministryName?: string;

  @IsOptional()
  @IsIn(CANDIDATE_ROLE_TYPES)
  roleType?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  district?: string;
}

@ValidatorConstraint({ name: 'identifiersMatchType' })
class IdentifiersMatchTypeConstraint implements ValidatorConstraintInterface {
  validate(identifiers: IdentifiersDto, args: ValidationArguments) {
    const { type } = args.object as CreateTicketAttributeDto;
    switch (type) {
      case 'committee':          return !!identifiers.committeeName;
      case 'sub_committee':      return !!identifiers.committeeName && !!identifiers.subCommitteeName;
      case 'government_ministry': return !!identifiers.ministryName;
      case 'role_type':          return !!identifiers.roleType;
      case 'education_field':    return !!identifiers.field;
      case 'residence_district': return !!identifiers.district;
      default:                   return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { type } = args.object as CreateTicketAttributeDto;
    return `identifiers fields do not match type "${type}"`;
  }
}

export class CreateTicketAttributeDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  tickets: string[];

  @IsIn(TICKET_ATTRIBUTE_TYPES)
  type: TicketAttributeType;

  @IsNumber()
  score: number;

  @ValidateNested()
  @Type(() => IdentifiersDto)
  @Validate(IdentifiersMatchTypeConstraint)
  identifiers: IdentifiersDto;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  vectorNames?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
