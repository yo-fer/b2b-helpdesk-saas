import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // global logger
  app.useLogger(app.get(Logger));

  // Error interceptions and pass them to logger
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // global validation pipe
  // protects api if a client sends invalid data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any properties that are not in the DTO,
      forbidNonWhitelisted: true, // throws an error if any properties are not in the DTO,
      transform: true, // automatically transforms payloads to be objects typed according to their DTO classes
    }),
  );

  // global logger
  app.useGlobalFilters(new AllExceptionsFilter());

  // swagger / openapi configuration
  const config = new DocumentBuilder()
    .setTitle('Helpdes Saas API')
    .setDescription('B2B Helpdesk API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CORS configuration
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
