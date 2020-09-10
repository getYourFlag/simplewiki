import { Controller, Get, Body, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { RegisterUserDto, UpdateUserDto, CreateUserDto } from './users.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { MinimumPermissionLevel } from 'src/auth/permission.decorator';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';

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

    @MinimumPermissionLevel(127)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post('create')
    async createUser(@Body() user: CreateUserDto): Promise<User> {
        return this.usersService.createUser(user);
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updates: UpdateUserDto): Promise<User> {
        return this.usersService.updateUser(id, updates);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number, @Body('password') password: string): Promise<boolean> {
        return this.usersService.deleteUser(id, password);
    } 

}