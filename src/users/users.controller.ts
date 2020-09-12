import { Controller, Get, Body, Param, Post, Put, Delete, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserDto, UpdateUserDto, CreateUserDto } from './users.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { MinimumPermissionLevel } from 'src/auth/auth.decorator';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';
import { PermissionLevel } from 'src/auth/auth.enum';

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
    async updateUser(@Request() req, @Param('id') id: number, @Body() updates: UpdateUserDto): Promise<User> {
        if (req.user?.id !== id) throw new HttpException('Permissions denied', HttpStatus.FORBIDDEN);
        return this.usersService.updateUser(id, updates);
    }

    @MinimumPermissionLevel(PermissionLevel.USER)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Delete(':id')
    async deleteUser(@Request() req, @Param('id') id: number, @Body('password') password: string): Promise<boolean> {
        if (req.user?.id !== id) throw new HttpException('Permissions denied', HttpStatus.FORBIDDEN);
        return this.usersService.deleteUser(id, password);
    }
}

@Controller('admin/users')
@MinimumPermissionLevel(PermissionLevel.ADMIN)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserManagementController {
    constructor(private usersService: UsersService) {};

    @Post()
    async createUser(@Body() user: CreateUserDto): Promise<User> {
        return this.usersService.createUser(user);
    }
}