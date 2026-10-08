import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({
    description: 'A brief summary of the issue',
    example: 'Cannot access billing dashboard',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed explanation of the problem',
    example: 'When I click on the billing tab, I get a 500 error.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'The priority level of the ticket',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}
