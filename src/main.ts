import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = app.get(ConfigService).get('PORT');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        }
    ));

    await app.select(UsersModule).get(UsersService).createDefaultUsers();
    await app.listen(port);
}
bootstrap();
