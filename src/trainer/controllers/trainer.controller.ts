import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TrainerApplicationService } from '../services/trainer-application.service';
import { CreateTrainerDto } from '../dto/create-trainer.dto';
import { UpdateTrainerDto } from '../dto/update-trainer.dto';
import { TrainerResponseDto } from '../dto/trainer-response.dto';

@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly trainerApplicationService: TrainerApplicationService,
  ) {}

  @Post()
  async create(@Body() dto: CreateTrainerDto): Promise<TrainerResponseDto> {
    return this.trainerApplicationService.create(dto);
  }

  @Get()
  async findAll(): Promise<TrainerResponseDto[]> {
    return this.trainerApplicationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<TrainerResponseDto> {
    return this.trainerApplicationService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainerApplicationService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.trainerApplicationService.remove(id);
  }
}
