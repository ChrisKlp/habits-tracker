import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/config/swagger';
import { NestFactory } from '@nestjs/core';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  console.log('✅ OpenAPI spec generated at openapi.json');
  await app.close();
  process.exit(0);
}

generateOpenApi().catch(console.error);
