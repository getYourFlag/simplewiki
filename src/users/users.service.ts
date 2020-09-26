import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './users.entity';
import { getRepository, Connection, MoreThanOrEqual, Repository } from 'typeorm';
import { RegisterUserDto, UpdateUserDto, CreateUserDto, deletedUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { PermissionLevel } from '../auth/auth.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    private async findUserById(id): Promise<User> {
        return await this.userRepository.findOneOrFail(id, {
            select: ['username', 'nick', 'permission', 'last_login', 'created_at', 'updated_at']
        });
    }

    private async findUserByIdAndAuthorize(id: number, password: string): Promise<User> {
        const user = await this.userRepository.findOneOrFail(id, {
            select: ['username', 'password', 'nick', 'permission', 'last_login', 'created_at', 'updated_at']
        });

        if (!password) throw new HttpException('Password not embedded in request', HttpStatus.BAD_REQUEST);
        const isAuthorized = await bcrypt.compare(password, user.password);
        if (!isAuthorized) throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        
        return user;
    }

    async getUser(id: number): Promise<User> {
        return await this.findUserById(id);
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.userRepository.find();
        return users;
    }

    async registerUser(user: RegisterUserDto): Promise<User> {
        user.password = await bcrypt.hash(user.password, 10);

        const newUser = this.userRepository.create(user);
        newUser.permission = 1;
        
        await this.userRepository.save(newUser);
        return newUser;
    }

    async createUser(userData: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({ ...userData, password: hashedPassword });
        await this.userRepository.save(user);

        return user;
    }

    async updateUser(id: number, updates: UpdateUserDto): Promise<User> {
        const user = await this.findUserByIdAndAuthorize(id, updates.password);

        // Changes password if newPassword is not null, else keep the original password.
        if (updates.newPassword) {
            updates.password = await bcrypt.hash(updates.newPassword, 10);
            delete updates.newPassword;
        } else {
            updates.password = user.password;
        }

        await this.userRepository.update(id, updates);
        return await this.findUserById(id);
    }

    async deleteUser(id: number, password: string): Promise<deletedUserDto> {
        const user = await this.findUserByIdAndAuthorize(id, password);

        await this.userRepository.softRemove(user);
        return {
            id,
            username: user.username,
            nick: user.nick
        };
    }

    async getUsersCount(minimumPermissionLevel = null): Promise<number> {
        const findOptions = minimumPermissionLevel ? {
            permission: MoreThanOrEqual(minimumPermissionLevel)
        } : Object.create(null);

        return await this.userRepository.count(findOptions);
    }

    async createDefaultUsers(displayWarningMessage: boolean = true): Promise<User> {
        const adminCount = await this.getUsersCount(PermissionLevel.ADMIN);
        if (adminCount > 0) {
            return;
        };

        if (displayWarningMessage) {
            console.log('No admin accounts were discovered within application, creating a default user for you.');
            console.log('The account\'s username and password is DEFAULT.');
            console.log('Please change the password of the account immediately after logging in the system.');
        }

        return await this.createUser({
            username: 'DEFAULT',
            password: 'DEFAULT',
            nick: 'DEFAULT ADMIN',
            permission: 127
        });
    }
}