import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { TeamPokemon } from '../../team/entities/team-pokemon.entity';

const dateTransformer: ValueTransformer = {
  to: (value: Date | null): string | null => value?.toISOString() ?? null,
  from: (value: string | null): Date | null => (value ? new Date(value) : null),
};

@Entity('pokemons')
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'poke_api_id', type: 'int', unique: true })
  pokeApiId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sprite: string | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'int', nullable: true })
  weight: number | null;

  @Column({ type: 'simple-json', nullable: true })
  types: string[] | null;

  @Column({
    name: 'last_synced_at',
    type: 'varchar',
    nullable: true,
    transformer: dateTransformer,
  })
  lastSyncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TeamPokemon, (teamPokemon) => teamPokemon.pokemon)
  teamPokemons: TeamPokemon[];
}
