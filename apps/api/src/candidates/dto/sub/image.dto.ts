import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ImageDto {
  @ApiProperty({ enum: ['primary', 'secondary', 'mobile', 'thumbnail'] })
  @IsIn(['primary', 'secondary', 'mobile', 'thumbnail'])
  imageType: 'primary' | 'secondary' | 'mobile' | 'thumbnail';

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
