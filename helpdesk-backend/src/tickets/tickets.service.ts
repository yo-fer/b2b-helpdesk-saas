import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    organizationId: string,
  ) {
    // // hardcode the userId for now
    // const tempOrganizationId = (await this.prisma.organization.findFirst())!.id;

    // const tempCreatorId = (await this.prisma.user.findFirst({
    //   where: {
    //     email: 'customer@bimbo.com',
    //   },
    // }))!.id;

    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        priority: createTicketDto.priority,
        //organizationId: tempOrganizationId,
        //creatorId: tempCreatorId,
        organizationId: organizationId,
        creatorId: userId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    organizationId: string,
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
