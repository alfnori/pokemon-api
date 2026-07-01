import { IsString, IsEmail, Length, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrainerDto {
  @ApiPropertyOptional({
    description: 'Trainer name',
    example: 'Ash Ketchum',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Trainer email',
    example: 'ash@pokemon.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Brazilian ZIP code',
    example: '01001-000',
    minLength: 8,
    maxLength: 9,
  })
  @IsOptional()
  @IsString()
  @Length(8, 9)
  cep?: string;
}
