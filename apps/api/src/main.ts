import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  //  Create the NestJS application
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  //  Apply global validation to all routes
  app.useGlobalPipes(new ZodValidationPipe());

  // Set up Swagger UI
  const config = new DocumentBuilder()
    .setTitle('J-address API')
    .setDescription('Virtual Japanese mail address service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 API is running on: http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`📖 Swagger docs: http://localhost:${process.env.PORT ?? 3001}/api`);
}
void bootstrap();
