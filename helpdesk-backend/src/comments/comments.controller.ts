import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to a ticket' })
  create(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(
      ticketId,
      createCommentDto,
      user.id,
      user.organizationId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a ticket' })
  findAll(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.findAllByTicket(ticketId, user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
