import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class UpdateTicketDto {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({
    description: 'ID of the agent assigned to the ticket',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
