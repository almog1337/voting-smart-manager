import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';

const TICKET_ATTRIBUTE_TYPES = [
  'committee',
  'sub_committee',
  'government_ministry',
  'role_type',
  'education_field',
  'residence_district',
] as const;

export type TicketAttributeType = (typeof TICKET_ATTRIBUTE_TYPES)[number];

export class CreateTicketAttributeDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  tickets: string[];

  @IsIn(TICKET_ATTRIBUTE_TYPES)
  type: TicketAttributeType;

  @IsNumber()
  score: number;

  @IsObject()
  identifiers: Record<string, string>;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
