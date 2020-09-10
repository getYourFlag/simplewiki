import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [ AuthModule ],
    controllers: [UserController],
    providers: [UsersService]
})

export class UsersModule {}