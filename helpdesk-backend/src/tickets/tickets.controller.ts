import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tickets') // /api/v1/tickets
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(
      createTicketDto,
      user.id,
      user.organizationId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tickets for the current organization',
  })
  findAll(@CurrentUser() user: any) {
    return this.ticketsService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific ticket by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.ticketsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ticket status or assing to an agent (Agents/Admins only)',
  })
  @Roles(Role.AGENT, Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
