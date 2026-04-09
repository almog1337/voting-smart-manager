import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CommitteeDto } from './sub/committee.dto.js';
import { EducationDto } from './sub/education.dto.js';
import { ImageDto } from './sub/image.dto.js';
import { LinkDto } from './sub/link.dto.js';
import { ResidenceDto } from './sub/residence.dto.js';
import {
  AnyRoleDto,
  KnessetRoleDto,
  MilitaryRoleDto,
  OtherRoleDto,
  PartyRoleDto,
  PublicRoleDto,
  RoleBaseDto,
} from './sub/role.dto.js';

export class CreateCandidateDto {
  @ApiProperty({ example: 'Yair Lapid' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 1963 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  birthYear?: number;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ enum: ['secular', 'religious'] })
  @IsOptional()
  @IsIn(['secular', 'religious'])
  sector?: 'secular' | 'religious';

  @ApiPropertyOptional({ enum: ['right', 'left', 'center'] })
  @IsOptional()
  @IsIn(['right', 'left', 'center'])
  orientation?: 'right' | 'left' | 'center';

  @ApiPropertyOptional({ type: [String], example: ['Hebrew', 'English'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isCurrentlyServing?: boolean;

  @ApiPropertyOptional({ type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @ApiPropertyOptional({ type: [ResidenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResidenceDto)
  residence?: ResidenceDto[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      oneOf: [
        { $ref: '#/components/schemas/PartyRoleDto' },
        { $ref: '#/components/schemas/MilitaryRoleDto' },
        { $ref: '#/components/schemas/KnessetRoleDto' },
        { $ref: '#/components/schemas/PublicRoleDto' },
        { $ref: '#/components/schemas/OtherRoleDto' },
      ],
    },
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleBaseDto, {
    discriminator: {
      property: 'roleType',
      subTypes: [
        { value: PartyRoleDto, name: 'party' },
        { value: MilitaryRoleDto, name: 'military' },
        { value: KnessetRoleDto, name: 'knesset' },
        { value: PublicRoleDto, name: 'public' },
        { value: OtherRoleDto, name: 'other' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  roles?: AnyRoleDto[];

  @ApiPropertyOptional({ type: [LinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];

  @ApiPropertyOptional({ type: [CommitteeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitteeDto)
  committees?: CommitteeDto[];

  @ApiPropertyOptional({ type: [ImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}
