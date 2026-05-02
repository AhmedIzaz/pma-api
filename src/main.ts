import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import setupSwagger from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  // ─── Handlebars view engine setup ───────────────────────
  // __dirname = dist/src/ at runtime, so go up 2 levels to project root
  app.setBaseViewsDir(join(__dirname, '..', '..', 'src', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', '..', 'src', 'public'));

  setupSwagger(app); //setup swagger

  const PORT = process.env.SERVER_PORT || 8000;
  const base = process.env.API_BASE || '';
  console.log('base', base);
  app.setGlobalPrefix(base, {
    exclude: [
      '/doctor/login',
      '/doctor/signup',
      '/doctor/dashboard',
      '/doctor/services',
      '/doctor/consultations',
    ],
  });
  await app.listen(PORT);
  console.log('Server is running on port:', PORT);
}
bootstrap();
