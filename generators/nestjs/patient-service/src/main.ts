import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3001);
  console.log(`Patient service listening on ${await app.getUrl()}`);
}
bootstrap();
