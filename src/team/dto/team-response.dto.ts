import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Team name', example: 'My Team' })
  name: string;

  @ApiProperty({ description: 'Trainer ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  trainerId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
