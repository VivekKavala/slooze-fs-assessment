import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let server: any;

export default async function handler(req: any, res: any) {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for your Frontend
    app.enableCors({
      origin: '*',
      credentials: true,
    });

    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server(req, res);
}
