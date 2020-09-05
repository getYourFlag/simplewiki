import { Controller, Get, Body, Param, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../dto/users.dto';

@Controller('users')
export class UserController {

    @Get()
    getUsers(): string {
        return 'Users are here!';
    }
    
    @Post()
    createUser(@Body() user: CreateUserDto): string {
        return 'Users are created!'
    }
}