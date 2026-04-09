import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EducationDto {
  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  training?: string;

  @ApiPropertyOptional({ example: 'B.Sc.' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ example: 'Law' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ example: 'Tel Aviv University' })
  @IsOptional()
  @IsString()
  institution?: string;
}
