import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class LinkDto {
  @ApiProperty({ enum: ['linkedin', 'wikipedia', 'knesset', 'other'] })
  @IsIn(['linkedin', 'wikipedia', 'knesset', 'other'])
  linkType: 'linkedin' | 'wikipedia' | 'knesset' | 'other';

  @ApiProperty({ example: 'https://www.linkedin.com/in/example' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
