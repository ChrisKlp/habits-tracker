import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  if (configService.get('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  app.setGlobalPrefix(configService.getOrThrow('API_PREFIX'));

  app.use(compression());
  app.use(helmet());

  app.enableCors({
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    maxAge: 3600,
    origin: (configService.get('ALLOWED_ORIGINS') as string).split(','),
  });

  app.use(cookieParser());

  await app.listen(configService.get('PORT') ?? 3001, () => {
    logger.log(
      [
        '\n',
        chalk.cyan('╔══════════════════════════════════════════════════════╗'),
        chalk.green.bold('  🚀 Service Started!'),
        chalk.cyanBright('  ────────────────────────────────────────────────────'),
        chalk.blueBright('  🌍 URL: ') +
          chalk.whiteBright.underline(
            `http://${configService.get('HOST')}:${configService.get('PORT')}`
          ),
        chalk.yellowBright('  📚 Docs: ') +
          chalk.whiteBright.underline(
            `http://${configService.get('HOST')}:${configService.get('PORT')}/docs`
          ),
        chalk.cyanBright('  🌱 Env: ') + chalk.whiteBright(`${configService.get('NODE_ENV')}`),
        chalk.cyan('╚══════════════════════════════════════════════════════╝'),
        '',
      ].join('\n')
    );
  });
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
