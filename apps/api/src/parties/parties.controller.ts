import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe.js';
import { CreatePartyDto } from './dto/create-party.dto.js';
import { UpdatePartyDto } from './dto/update-party.dto.js';
import { PartiesService } from './parties.service.js';

@ApiTags('parties')
@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a party' })
  @ApiCreatedResponse({ description: 'Party created successfully' })
  create(@Body() dto: CreatePartyDto) {
    return this.partiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a party' })
  @ApiParam({ name: 'id', description: 'Party ObjectId' })
  @ApiOkResponse({ description: 'Party updated successfully' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdatePartyDto) {
    return this.partiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a party' })
  @ApiParam({ name: 'id', description: 'Party ObjectId' })
  @ApiNoContentResponse({ description: 'Party deleted successfully' })
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.partiesService.delete(id);
  }
}
