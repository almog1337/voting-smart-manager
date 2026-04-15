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
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { TicketsService } from './tickets.service.js';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tickets' })
  @ApiOkResponse({ description: 'List of tickets' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ObjectId' })
  @ApiOkResponse({ description: 'Ticket found' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a ticket' })
  @ApiCreatedResponse({ description: 'Ticket created successfully' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ObjectId' })
  @ApiOkResponse({ description: 'Ticket updated successfully' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ObjectId' })
  @ApiNoContentResponse({ description: 'Ticket deleted successfully' })
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ticketsService.delete(id);
  }
}
