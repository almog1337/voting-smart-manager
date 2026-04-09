import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ResidenceDto {
  @ApiProperty({ example: 'Tel Aviv' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'Tel Aviv District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 3.2 })
  @IsOptional()
  @IsNumber()
  geographicPeriphery?: number;

  @ApiPropertyOptional({ example: 'Israel' })
  @IsOptional()
  @IsString()
  birthCountry?: string;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
