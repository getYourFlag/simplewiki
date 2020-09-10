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

    async authenticate(username: string, password: string): Promise<any> {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.username = :username", { username })
            .getOne();
        if (!user) return null;

        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (!isAuthenticated) return null;

        return user;
    }

    public generateToken = async (user: User) => ({ 
        access_token: this.jwtService.sign({
            username: user.username,
            permission: user.permission
        })
    })
}
