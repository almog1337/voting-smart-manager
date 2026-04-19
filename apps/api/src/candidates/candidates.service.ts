import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ICandidate, MODEL_CANDIDATE } from '../schemas/index.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { UpdateCandidateDto } from './dto/update-candidate.dto.js';

@Injectable()
export class CandidatesService {
  constructor(
    @Inject(MODEL_CANDIDATE)
    private readonly candidateModel: Model<ICandidate>,
  ) {}

  async findAll(): Promise<ICandidate[]> {
    return this.candidateModel.find() as unknown as ICandidate[];
  }

  async findOne(id: string): Promise<ICandidate> {
    const doc = await this.candidateModel.findById(id);
    if (!doc) throw new NotFoundException(`Candidate ${id} not found`);
    return doc as unknown as ICandidate;
  }

  async create(dto: CreateCandidateDto): Promise<ICandidate> {
    return new this.candidateModel(dto).save();
  }

  async update(id: string, dto: UpdateCandidateDto): Promise<ICandidate> {
    const doc = await this.candidateModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!doc) throw new NotFoundException(`Candidate ${id} not found`);
    return doc;
  }

  async delete(id: string): Promise<void> {
    const doc = await this.candidateModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException(`Candidate ${id} not found`);
  }
}
