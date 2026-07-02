import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TeamApplicationService } from '../services/team-application.service';
import { TeamResponseDto } from '../dto/team-response.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddPokemonToTeamDto } from '../dto/add-pokemon-to-team.dto';
import { AddPokemonResponseDto } from '../dto/add-pokemon-response.dto';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamApplicationService: TeamApplicationService,
  ) {}

  @Post()
  async create(@Body() dto: CreateTeamDto): Promise<TeamResponseDto> {
    return this.teamApplicationService.create(dto);
  }

  @Get()
  async findAll(): Promise<TeamResponseDto[]> {
    return this.teamApplicationService.findAll();
  }

  @Get(':id')
  async findByIdWithTeam(@Param('id') id: string): Promise<TeamResponseDto> {
    return this.teamApplicationService.findByIdWithTeam(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.teamApplicationService.remove(id);
  }

  @Post(':id/pokemons')
  async addPokemon(
    @Param('id') teamId: string,
    @Body() dto: AddPokemonToTeamDto,
  ): Promise<AddPokemonResponseDto> {
    return this.teamApplicationService.addPokemon(teamId, dto.pokemonId);
  }

  @Delete(':id/pokemons/:pokemonId')
  async removePokemon(
    @Param('id') teamId: string,
    @Param('pokemonId') pokemonId: string,
  ): Promise<void> {
    return this.teamApplicationService.removePokemon(teamId, pokemonId);
  }
}
