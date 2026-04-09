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
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe.js';
import { CreateTicketAttributeDto } from './dto/create-ticket-attribute.dto.js';
import { UpdateTicketAttributeDto } from './dto/update-ticket-attribute.dto.js';
import { TicketAttributesService } from './ticket-attributes.service.js';

@Controller('ticket-attributes')
export class TicketAttributesController {
  constructor(private readonly taService: TicketAttributesService) {}

  @Post()
  create(@Body() dto: CreateTicketAttributeDto) {
    return this.taService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTicketAttributeDto,
  ) {
    return this.taService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.taService.delete(id);
  }
}
