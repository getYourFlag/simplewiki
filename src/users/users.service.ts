import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './users.entity';
import { getRepository, Connection } from 'typeorm';
import { RegisterUserDto, UpdateUserDto, CreateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private userRepository;

    constructor(private connection: Connection) {
        this.userRepository = getRepository(User);
    }

    private async findUserById(id): Promise<User> {
        const user = await this.userRepository.findOne(id);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return user;
    }

    private async findUserByIdAndAuthorize(id: number, password: string): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", { id })
            .getOne();
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
        return newUser;
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

}