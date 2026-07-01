import { IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainerDto {
  @ApiProperty({
    description: 'Trainer name',
    example: 'Ash Ketchum',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Trainer email', example: 'ash@pokemon.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Brazilian ZIP code',
    example: '01001-000',
    minLength: 8,
    maxLength: 9,
  })
  @IsString()
  @Length(8, 9)
  cep: string;
}
