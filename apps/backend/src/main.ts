import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
