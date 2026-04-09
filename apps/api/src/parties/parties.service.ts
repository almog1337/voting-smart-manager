import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { IParty, MODEL_PARTY } from '../schemas/index.js';
import { CreatePartyDto } from './dto/create-party.dto.js';
import { UpdatePartyDto } from './dto/update-party.dto.js';

@Injectable()
export class PartiesService {
  constructor(@Inject(MODEL_PARTY) private readonly partyModel: Model<IParty>) {}

  async create(dto: CreatePartyDto): Promise<IParty> {
    try {
      return await new this.partyModel(dto).save();
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('A party with this name already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdatePartyDto): Promise<IParty> {
    const doc = await this.partyModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!doc) throw new NotFoundException(`Party ${id} not found`);
    return doc;
  }

  async delete(id: string): Promise<void> {
    const doc = await this.partyModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException(`Party ${id} not found`);
  }
}
