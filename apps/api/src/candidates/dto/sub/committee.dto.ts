import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommitteeDto {
  @ApiProperty({ enum: ['participation', 'management', 'chair'] })
  @IsIn(['participation', 'management', 'chair'])
  participationType: 'participation' | 'management' | 'chair';

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  committeeId?: string;

  @ApiProperty({ example: 'Finance Committee' })
  @IsString()
  @IsNotEmpty()
  committeeName: string;
}
