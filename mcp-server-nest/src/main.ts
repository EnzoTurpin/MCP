import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // On ajoute l'option { logger: false } pour que NestJS reste silencieux
  const app = await NestFactory.create(AppModule, {
    logger: false, 
  });

  // Ton port actuel (probablement 3000)
  await app.listen(3000);
}
bootstrap();