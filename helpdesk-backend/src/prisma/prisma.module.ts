import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // This makes the PrismaService available globally in the application, so it doesn't have to be imported in every module.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // This allows other modules to import and use the PrismaService.
})
export class PrismaModule {}
