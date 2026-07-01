import { IsString, IsEmail, Length, IsOptional } from 'class-validator';

export class UpdateTrainerDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 9)
  cep?: string;
}
