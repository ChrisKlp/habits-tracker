import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Habits Tracker API')
      .setDescription('API for habits tracker')
      .setVersion('1.0')
      .build();
    const documentFactory = SwaggerModule.createDocument(app, config);

    writeFileSync(
      './openapi.json',
      JSON.stringify(cleanupOpenApiDoc(documentFactory), null, 2),
    );
    // SwaggerModule.setup('docs', app, cleanupOpenApiDoc(documentFactory));
  }

  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix(configService.getOrThrow('API_PREFIX'));

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
