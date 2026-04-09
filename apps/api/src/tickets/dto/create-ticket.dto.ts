import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VectorDto } from './vector.dto.js';

export class CreateTicketDto {
  @ApiProperty({ example: 'Likud 2024' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 3.25 })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ type: [VectorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VectorDto)
  vectors?: VectorDto[];
}
