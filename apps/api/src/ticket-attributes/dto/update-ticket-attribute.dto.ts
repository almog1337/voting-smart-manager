import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketAttributeDto } from './create-ticket-attribute.dto.js';

export class UpdateTicketAttributeDto extends PartialType(
  CreateTicketAttributeDto,
) {}
