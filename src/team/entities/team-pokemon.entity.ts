import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Team } from './team.entity';
import { Pokemon } from '../../pokemon/entities/pokemon.entity';

@Entity('team_pokemons')
@Unique('uq_team_pokemon', ['teamId', 'pokemonId'])
@Index('idx_team_pokemon_team', ['teamId'])
@Index('idx_team_pokemon_pokemon', ['pokemonId'])
export class TeamPokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId: string;

  @Column({ type: 'uuid', name: 'pokemon_id' })
  pokemonId: string;

  @Column({ type: 'int', nullable: true })
  position: number | null;

  @ManyToOne(() => Team, (team) => team.teamPokemons)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.teamPokemons)
  @JoinColumn({ name: 'pokemon_id' })
  pokemon: Pokemon;

  @CreateDateColumn()
  createdAt: Date;
}
