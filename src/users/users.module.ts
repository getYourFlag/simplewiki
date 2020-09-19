import { Module } from '@nestjs/common';
import { UserController, UserManagementController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [ AuthModule ],
    controllers: [UserController, UserManagementController],
    providers: [UsersService]
})

export class UsersModule {}