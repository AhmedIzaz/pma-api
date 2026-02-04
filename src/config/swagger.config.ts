import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const setupSwagger = (intance: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Personal Medical Assistant API')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(intance, config);
  SwaggerModule.setup('api/docs', intance, documentFactory);
};
export default setupSwagger;
