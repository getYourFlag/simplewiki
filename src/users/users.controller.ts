import { Controller, Get, Body, Param, Post, Put, Delete, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserDto, UpdateUserDto, CreateUserDto, deletedUserDto } from './users.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { User as ReqUser } from './users.decorator';
import { MinimumPermissionLevel } from '../auth/auth.decorator';
import { JwtAuthGuard, PermissionGuard } from '../auth/auth.guard';
import { PermissionLevel } from '../auth/auth.enum';

@Controller('users')
export class UserController {
    constructor(private usersService: UsersService) {};

    @Get(':id')
    async getUser(@Param('id') id: number): Promise<User> {
        return this.usersService.getUser(id);
    }
    
    @Post()
    async registerUser(@Body() user: RegisterUserDto): Promise<User> {
        return this.usersService.registerUser(user);
    }

    @MinimumPermissionLevel(PermissionLevel.USER)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Put(':id')
    async updateUser(@ReqUser('id') loggedInUserId: number, @Param('id') userId: number, @Body() updates: UpdateUserDto): Promise<User> {
        if (loggedInUserId != userId) throw new HttpException('Permissions denied', HttpStatus.FORBIDDEN);
        return this.usersService.updateUser(userId, updates);
    }

    @MinimumPermissionLevel(PermissionLevel.USER)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Delete(':id')
    async deleteUser(@ReqUser('id') loggedInUserId: number, @Param('id') userId: number, @Body('password') password: string): Promise<deletedUserDto> {
        if (loggedInUserId != userId) throw new HttpException('Permissions denied', HttpStatus.FORBIDDEN);
        return this.usersService.deleteUser(userId, password);
    }
}

@Controller('admin/users')
@MinimumPermissionLevel(PermissionLevel.ADMIN)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserManagementController {
    constructor(private usersService: UsersService) {};

    @Post()
    async createUser(@ReqUser('permission') permission: number, @Body() userData: CreateUserDto): Promise<User> {
        return this.usersService.createUser(permission, userData);
    }
}