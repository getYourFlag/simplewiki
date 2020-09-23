import { Module } from '@nestjs/common';
import { UserController, UserManagementController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';

@Module({
    imports: [ AuthModule, TypeOrmModule.forFeature( [ User ]) ],
    controllers: [UserController, UserManagementController],
    providers: [UsersService]
})

export class UsersModule {}