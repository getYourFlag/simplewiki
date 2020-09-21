import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepository, Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
    private userRepository;

    constructor(
        private connection: Connection,
        private jwtService: JwtService
    ) {
        this.userRepository = getRepository(User);
    }

    async authenticate(username: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            select: ['id', 'username', 'password', 'permission'],
            where: { username }
        });
        if (!user) return null;

        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (!isAuthenticated) return null;

        await this.userRepository.update(user.id, { last_login: new Date().toString()})

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
