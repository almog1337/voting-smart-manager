import { PartialType } from '@nestjs/swagger';
import { CreateCandidateDto } from './create-candidate.dto.js';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}
