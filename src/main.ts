import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get config
  const port = configService.get<number>('app.port') || 3000;

  // Start server
  await app.listen(port);
  return port;
}
bootstrap()
  .then((port) =>
    console.log(`🚀  Server ready at ${port}, started in ${process.uptime()}s`),
  )
  .catch((e) => console.error(e.message, e));
