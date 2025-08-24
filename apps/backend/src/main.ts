import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
