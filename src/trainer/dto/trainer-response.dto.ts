import { ApiProperty } from '@nestjs/swagger';

export class TrainerResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Trainer name', example: 'Ash Ketchum' })
  name: string;

  @ApiProperty({ description: 'Trainer email', example: 'ash@pokemon.com' })
  email: string;

  @ApiProperty({ description: 'Brazilian ZIP code', example: '01001-000' })
  cep: string;

  @ApiProperty({ description: 'Street address', nullable: true, example: 'Rua Exemplo' })
  street: string | null;

  @ApiProperty({ description: 'Neighborhood', nullable: true, example: 'Centro' })
  district: string | null;

  @ApiProperty({ description: 'City', nullable: true, example: 'São Paulo' })
  city: string | null;

  @ApiProperty({ description: 'State', nullable: true, example: 'SP' })
  state: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
