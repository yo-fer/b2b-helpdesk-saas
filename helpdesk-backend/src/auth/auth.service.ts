import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verify if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Generate a 'slug' for the organization
    const slug = registerDto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existingOrg) {
      throw new ConflictException('Organizatino name is already taken');
    }

    // hashed passwords
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Transaction: create organisation and user
    const user = await this.prisma.$transaction(async (prisma) => {
      const organization = await prisma.organization.create({
        data: {
          name: registerDto.organizationName,
          slug,
        },
      });

      return prisma.user.create({
        data: {
          email: registerDto.email,
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: Role.ADMIN,
          organizationId: organization.id,
        },
      });
    });

    // Return token for user can login
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    // Search for user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // check password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    // Public payload for JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
