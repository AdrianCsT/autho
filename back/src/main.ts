import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { DocumentationConfigService } from './common/config';
import { DocumentationSetupService, DocumentationLoggerService } from './common/services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  // Get configuration services
  const configService = app.get(ConfigService);
  const documentationConfigService = new DocumentationConfigService(configService);
  const documentationLoggerService = new DocumentationLoggerService(configService, documentationConfigService);
  const documentationSetupService = new DocumentationSetupService(
    configService,
    documentationConfigService,
    documentationLoggerService,
  );

  // Set up API documentation with environment-specific configuration
  await documentationSetupService.setupDocumentation(app);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  // Enhanced logging with environment awareness
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  console.log(`🚀 Server started on port ${port} (${nodeEnv} environment)`);
}
bootstrap();
