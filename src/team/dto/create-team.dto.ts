import { IsString, IsUUID, Length } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsUUID()
  trainerId: string;
}
