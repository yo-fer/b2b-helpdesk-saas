import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'Acme Inc.',
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'Lizbeth',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Hernandez',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
