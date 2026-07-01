import { IsString, IsEmail, Length } from 'class-validator';

export class CreateTrainerDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 9)
  cep: string;
}
