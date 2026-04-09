import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RoleBaseDto {
  @ApiProperty({ enum: ['party', 'military', 'knesset', 'public', 'other'] })
  @IsIn(['party', 'military', 'knesset', 'public', 'other'])
  roleType: 'party' | 'military' | 'knesset' | 'public' | 'other';

  @ApiProperty({ example: 'Minister of Finance' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

export class PartyRoleDto extends RoleBaseDto {
  @ApiProperty({ enum: ['party'], default: 'party' })
  roleType: 'party' = 'party';

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  partyId: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  listPosition?: number;
}

export class MilitaryRoleDto extends RoleBaseDto {
  @ApiProperty({ enum: ['military'], default: 'military' })
  roleType: 'military' = 'military';

  @ApiPropertyOptional({ example: 'General' })
  @IsOptional()
  @IsString()
  rank?: string;

  @ApiPropertyOptional({ example: '8200' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class KnessetRoleDto extends RoleBaseDto {
  @ApiProperty({ enum: ['knesset'], default: 'knesset' })
  roleType: 'knesset' = 'knesset';

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  knessetNum?: number;
}

export class PublicRoleDto extends RoleBaseDto {
  @ApiProperty({ enum: ['public'], default: 'public' })
  roleType: 'public' = 'public';

  @ApiPropertyOptional({ example: 'Ministry of Defense' })
  @IsOptional()
  @IsString()
  ministry?: string;
}

export class OtherRoleDto extends RoleBaseDto {
  @ApiProperty({ enum: ['other'], default: 'other' })
  roleType: 'other' = 'other';
}

export type AnyRoleDto =
  | PartyRoleDto
  | MilitaryRoleDto
  | KnessetRoleDto
  | PublicRoleDto
  | OtherRoleDto;
