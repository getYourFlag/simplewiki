import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
    }

    async authenticate(username: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            select: ['id', 'username', 'password', 'permission'],
            where: { username }
        });
        if (!user) return null; // Returns 401 if user is not found.

        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (!isAuthenticated) return null; // Returns 401 if password is incorrect.

        await this.userRepository.update(user.id, { 
            last_login: new Date() 
        });

        return user;
    }

    public generateToken = async (user: User) => ({ 
        access_token: this.jwtService.sign({
            id: user.id,
            username: user.username,
            permission: user.permission
        })
    })
}
