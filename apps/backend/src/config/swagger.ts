import { writeFileSync } from 'fs';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Habits Tracker API')
    .setDescription('API for habits tracker')
    .setVersion('1.0')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  const cleanDoc = cleanupOpenApiDoc(documentFactory);

  writeFileSync('./openapi.json', JSON.stringify(cleanDoc, null, 2));

  // SwaggerModule.setup('docs', app, cleanDoc);

  return cleanDoc;
}
