import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateTicketAttributeDto } from './dto/create-ticket-attribute.dto.js';
import { UpdateTicketAttributeDto } from './dto/update-ticket-attribute.dto.js';
import { TicketAttributesService } from './ticket-attributes.service.js';

@ApiTags('ticket-attributes')
@Controller('ticket-attributes')
export class TicketAttributesController {
  constructor(private readonly taService: TicketAttributesService) {}

  @Get()
  @ApiOperation({ summary: 'List all ticket attributes' })
  @ApiOkResponse({ description: 'List of ticket attributes' })
  findAll() {
    return this.taService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket attribute by ID' })
  @ApiParam({ name: 'id', description: 'TicketAttribute ObjectId' })
  @ApiOkResponse({ description: 'Ticket attribute found' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.taService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a ticket attribute' })
  @ApiCreatedResponse({ description: 'Ticket attribute created successfully' })
  create(@Body() dto: CreateTicketAttributeDto) {
    return this.taService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ticket attribute' })
  @ApiParam({ name: 'id', description: 'TicketAttribute ObjectId' })
  @ApiOkResponse({ description: 'Ticket attribute updated successfully' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTicketAttributeDto,
  ) {
    return this.taService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket attribute' })
  @ApiParam({ name: 'id', description: 'TicketAttribute ObjectId' })
  @ApiNoContentResponse({ description: 'Ticket attribute deleted successfully' })
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.taService.delete(id);
  }
}
