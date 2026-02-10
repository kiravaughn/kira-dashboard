import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:4000').split(','),
    credentials: true,
  });
  
  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}
bootstrap();
