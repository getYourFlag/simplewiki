import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users.module';

export const imports = [
    ConfigModule.forRoot({
        isGlobal: true
    }),
    TypeOrmModule.forRoot(),
    UsersModule
];