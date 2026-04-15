import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ITicket, MODEL_TICKET } from '../schemas/index.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(MODEL_TICKET) private readonly ticketModel: Model<ITicket>,
  ) {}

  async findAll(): Promise<ITicket[]> {
    return this.ticketModel.find().lean() as unknown as ITicket[];
  }

  async findOne(id: string): Promise<ITicket> {
    const doc = await this.ticketModel.findById(id).lean() as unknown as ITicket | null;
    if (!doc) throw new NotFoundException(`Ticket ${id} not found`);
    return doc;
  }

  async create(dto: CreateTicketDto): Promise<ITicket> {
    try {
      return await new this.ticketModel(dto).save();
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('A ticket with this name already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateTicketDto): Promise<ITicket> {
    const doc = await this.ticketModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!doc) throw new NotFoundException(`Ticket ${id} not found`);
    return doc;
  }

  async delete(id: string): Promise<void> {
    const doc = await this.ticketModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException(`Ticket ${id} not found`);
  }
}
