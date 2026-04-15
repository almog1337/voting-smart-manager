import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ITicketAttribute, MODEL_TICKET_ATTRIBUTE } from '../schemas/index.js';
import { CreateTicketAttributeDto } from './dto/create-ticket-attribute.dto.js';
import { UpdateTicketAttributeDto } from './dto/update-ticket-attribute.dto.js';

@Injectable()
export class TicketAttributesService {
  constructor(
    @Inject(MODEL_TICKET_ATTRIBUTE)
    private readonly taModel: Model<ITicketAttribute>,
  ) {}

  async findAll(): Promise<ITicketAttribute[]> {
    return this.taModel.find().lean() as unknown as ITicketAttribute[];
  }

  async findOne(id: string): Promise<ITicketAttribute> {
    const doc = await this.taModel.findById(id).lean() as unknown as ITicketAttribute | null;
    if (!doc) throw new NotFoundException(`TicketAttribute ${id} not found`);
    return doc;
  }

  async create(dto: CreateTicketAttributeDto): Promise<ITicketAttribute> {
    return new this.taModel(dto).save();
  }

  async update(
    id: string,
    dto: UpdateTicketAttributeDto,
  ): Promise<ITicketAttribute> {
    const doc = await this.taModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!doc) throw new NotFoundException(`TicketAttribute ${id} not found`);
    return doc;
  }

  async delete(id: string): Promise<void> {
    const doc = await this.taModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException(`TicketAttribute ${id} not found`);
  }
}
