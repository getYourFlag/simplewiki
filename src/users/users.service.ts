import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './users.entity';
import { getRepository, Connection, MoreThanOrEqual } from 'typeorm';
import { RegisterUserDto, UpdateUserDto, CreateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { PermissionLevel } from '../auth/auth.enum';

@Injectable()
export class UsersService {
    private userRepository;

    constructor(private connection: Connection) {
        this.userRepository = getRepository(User);
    }

    private async findUserById(id): Promise<User> {
        const user = await this.userRepository.findOne(id, {
            select: ['username', 'nick', 'permission', 'last_login', 'created_at', 'updated_at']
        });
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return user;
    }

    private async findUserByIdAndAuthorize(id: number, password: string): Promise<User> {
        const user = await this.userRepository.findOne(id, {
                select: ['username', 'password', 'nick', 'permission', 'last_login', 'created_at', 'updated_at']
            })
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

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
        return newUser.generatedMaps[0];
    }

    async createUser(user: CreateUserDto): Promise<User> {
        user.password = await bcrypt.hash(user.password, 10);
        return await this.userRepository.insert(user);
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

    async deleteUser(id: number, password: string): Promise<boolean> {
        const user = await this.findUserByIdAndAuthorize(id, password);

        await this.userRepository.softRemove(user);
        return true;
    }

    async getUsersCount(minimumPermissionLevel = null): Promise<number> {
        const findOptions = minimumPermissionLevel ? {
            permission: MoreThanOrEqual(minimumPermissionLevel)
        } : Object.create(null);

        return await this.userRepository.count(findOptions);
    }

    async createDefaultUsers(): Promise<void> {
        const adminCount = await this.getUsersCount(PermissionLevel.ADMIN);
        if (adminCount > 0) {
            return;
        };

        console.log('No admin accounts were discovered within application, creating a default user for you.');
        console.log('The account\'s username and password is DEFAULT.');
        console.log('Please change the password of the account immediately after logging in the system.');

        await this.createUser({
            username: 'DEFAULT',
            password: 'DEFAULT',
            nick: 'DEFAULT ADMIN',
            permission: 127
        });
    }
}