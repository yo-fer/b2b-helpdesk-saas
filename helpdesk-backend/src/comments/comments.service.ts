import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ticketId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
    organizationId: string,
  ) {
    // Validate that this ticker exists in this organization
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, organizationId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Create comment
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        ticketId: ticketId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findAllByTicket(ticketId: string, organizationId: string) {
    // Validating existence and belonging
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, organizationId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
