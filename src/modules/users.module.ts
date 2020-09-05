import { Module } from '@nestjs/common';
import { UserController } from '../controllers/users.controller';

@Module({
    controllers: [UserController],
    providers: []
})

export class UsersModule {}