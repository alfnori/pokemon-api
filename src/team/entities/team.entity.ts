import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Trainer } from '../../trainer/entities/trainer.entity';
import { TeamPokemon } from './team-pokemon.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid', name: 'trainer_id' })
  trainerId: string;

  @ManyToOne(() => Trainer, (trainer) => trainer.teams)
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @OneToMany(() => TeamPokemon, (teamPokemon) => teamPokemon.team)
  teamPokemons: TeamPokemon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
