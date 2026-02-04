import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './common/guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
 
  setupSwagger(app); //setup swagger

  const PORT = process.env.SERVER_PORT || 8000;
  await app.listen(PORT);
  console.log('Server is running on port:', PORT);
}
bootstrap();
