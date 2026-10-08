import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { UsersModule } from './users/users.module.js';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  levelFirst: true,
                },
              }
            : undefined,
        autoLogging: true,
      },
    }),
    PrismaModule,
    TicketsModule,
    AuthModule,
    CommentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
