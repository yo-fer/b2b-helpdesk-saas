import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Could you please provide a screenshot?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
