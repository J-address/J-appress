import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  //  Create the NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  //  Apply global validation to all routes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra properties
      transform: true, // Auto-convert types
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 API is running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
}
void bootstrap();
