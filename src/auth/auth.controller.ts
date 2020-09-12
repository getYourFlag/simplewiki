import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth.guard';
import { User } from 'src/users/users.decorator';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@User() user) {
        return this.authService.generateToken(user);
    }
    
}