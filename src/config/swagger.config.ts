import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const setupSwagger = (intance: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Personal Medical Assistant API')
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(intance, config);
    const route = process.env.API_BASE + '/api/docsAcheEiRoute';
    console.log("route", route)
    SwaggerModule.setup(route, intance, documentFactory);
};
export default setupSwagger;
