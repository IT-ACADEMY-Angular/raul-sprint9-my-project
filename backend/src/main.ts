import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  app.use((req, res, next) => {
    next();
  });

  app.use('/favicon.ico', (req, res) => res.status(204).end());

  app.set('trust proxy', true);

  await app.listen(3000);
}

void bootstrap();