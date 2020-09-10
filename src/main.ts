import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = app.get(ConfigService).get('PORT');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        }
    ));
    await app.listen(port);
}
bootstrap();
