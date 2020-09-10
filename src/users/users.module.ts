import { Module } from '@nestjs/common';
import { UserController, UserManagementController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [ AuthModule ],
    controllers: [UserController, UserManagementController],
    providers: [UsersService]
})

export class UsersModule {}