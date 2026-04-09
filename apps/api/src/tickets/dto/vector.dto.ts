import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class VectorDto {
  @ApiProperty({ example: 'Security' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ['right', 'left'] })
  @IsIn(['right', 'left'])
  orientation!: 'right' | 'left';
}
