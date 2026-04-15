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
import { CandidatesService } from './candidates.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { UpdateCandidateDto } from './dto/update-candidate.dto.js';

@ApiTags('candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all candidates' })
  @ApiOkResponse({ description: 'List of candidates' })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a candidate by ID' })
  @ApiParam({ name: 'id', description: 'Candidate ObjectId' })
  @ApiOkResponse({ description: 'Candidate found' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a candidate' })
  @ApiCreatedResponse({ description: 'Candidate created successfully' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a candidate' })
  @ApiParam({ name: 'id', description: 'Candidate ObjectId' })
  @ApiOkResponse({ description: 'Candidate updated successfully' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a candidate' })
  @ApiParam({ name: 'id', description: 'Candidate ObjectId' })
  @ApiNoContentResponse({ description: 'Candidate deleted successfully' })
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.candidatesService.delete(id);
  }
}
