import { Test, TestingModule } from '@nestjs/testing';
import { User } from './users.entity';
import { DeepPartial, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PermissionLevel } from '../auth/auth.enum';
import { create } from 'domain';
import { HttpException } from '@nestjs/common';

const testingUser: DeepPartial<User> = {
    username: 'DEFAULT',
    password: 'DEFAULT',
    nick: 'DEFAULT ADMIN',
    permission: 127,
    last_login: Date.now(),
    created_at: Date.now(),
    updated_at: Date.now()
}

describe('Unit test AuthService', () => {
    jest.mock('bcrypt');

    let module: TestingModule;
    let service: UsersService;
    let repository: Repository<User>;
    let bcryptCompare: jest.Mock;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [ 
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository
                }
            ],
        }).compile();
    });

    beforeEach(async () => {
        bcryptCompare = jest.fn().mockResolvedValue(true);
        bcrypt.compare = bcryptCompare;

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));

        jest.spyOn(repository, 'findOneOrFail').mockResolvedValue(testingUser as User);
        jest.spyOn(repository, 'find').mockResolvedValue([testingUser] as User[]);
        jest.spyOn(repository, 'create').mockReturnValue(testingUser as User);
        jest.spyOn(repository, 'save').mockResolvedValue(testingUser as User);
        jest.spyOn(repository, 'update').mockResolvedValue(testingUser as any);
        jest.spyOn(repository, 'count').mockResolvedValue(1);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return 404 error if user was not found', () => {
        const error = { 'message': 'The requested user was not found' }
        jest.spyOn(repository, 'findOneOrFail').mockRejectedValue(error);
        expect(service.getUser(1)).rejects.toMatchObject(error);
    });

    it('should return user in getUser method', () => {
        expect(service.getUser(1)).resolves.toMatchObject(testingUser);
    });

    it('should return array of users in getAllUsers method', async () => {
        const allUsers = await service.getAllUsers();
        expect(allUsers).toBeInstanceOf(Array);
        expect(allUsers.length).toBe(1);
    });

    it('should register user with permission level as USER on registerUser method', async () => {
        const registeredUser = await service.registerUser({
            username: testingUser.username,
            password: 'DEFAULT',
            nick: testingUser.nick
        });
        expect(registeredUser).toMatchObject({
            nick: testingUser.nick,
            permission: PermissionLevel.USER
        });
    });

    it('should create user on createUser method', async () => {
        jest.spyOn(repository, 'create').mockReturnValue({...testingUser, permission: PermissionLevel.ADMIN} as User);

        const createdUser = await service.createUser(PermissionLevel.ADMIN, {
            username: testingUser.username,
            password: 'DEFAULT',
            nick: testingUser.nick,
            permission: PermissionLevel.ADMIN
        });
        expect(createdUser).toMatchObject({
            nick: testingUser.nick,
            permission: PermissionLevel.ADMIN
        });
    });

    it('should throw error if permissions of the user is lower than the account attempting to create on createUser method', async () => {
        expect(service.createUser(PermissionLevel.ADMIN, {
            username: testingUser.username,
            password: 'abc',
            nick: testingUser.nick,
            permission: PermissionLevel.OPERATOR
        })).rejects.toBeInstanceOf(HttpException);
    })

    it('should return updated user on updateUser method', async() => {
        const userData = {
            username: testingUser.username,
            password: testingUser.password,
            newPassword: 'abc',
            nick: testingUser.nick
        }
        const updatedUser = await service.updateUser(1, userData);
        expect(updatedUser).toMatchObject({
            username: testingUser.username,
            nick: testingUser.nick,
            last_login: testingUser.last_login
        });
    });

    it('should throw exception if password is not embedded in request for updating User', async() => {
        const userData = {
            username: testingUser.username,
            newPassword: 'abc',
            nick: testingUser.nick
        }
        expect(service.updateUser(1, userData as any)).rejects.toBeInstanceOf(HttpException);
    });

    it('should throw exception if password is incorrect for updating User', async() => {
        bcrypt.compare = jest.fn().mockResolvedValue(false);
        const userData = {
            username: testingUser.username,
            newPassword: 'abc',
            nick: testingUser.nick
        }
        expect(service.updateUser(1, userData as any)).rejects.toBeInstanceOf(HttpException);
    });

    it('should throw exception if password is not provided for deleting user', async () => {
        bcrypt.compare = jest.fn().mockResolvedValue(false);
        expect(service.updateUser(1, {} as any)).rejects.toBeInstanceOf(HttpException);
    });

    it('should throw exception if password is incorrect for deleting user', async () => {
        bcrypt.compare = jest.fn().mockResolvedValue(false);
        const userData = {
            password: 'abc'
        }
        expect(service.updateUser(1, userData as any)).rejects.toBeInstanceOf(HttpException);
    });

    it('should return an instance of deleteUserDto on deleteUser method', async () => {
        jest.spyOn(repository, 'softRemove').mockResolvedValue(true as any);

        expect(service.deleteUser(1, 'abc')).resolves.toMatchObject({
            id: 1,
            username: testingUser.username,
            nick: testingUser.nick
        });
    });

    it('should return a number on getUsersCount method', async () => {
        expect(await service.getUsersCount()).toBe(1);
    });

    it('should return a number on getUsersCount method when parameter is given', async () => {
        expect(await service.getUsersCount(PermissionLevel.USER)).toBe(1);
    });

    it('should return null on createDefaultUser when there is at least 1 operator account', async () => {
        expect(await service.createDefaultUsers()).toBeNull();
    });

    it('should return the default user when there is no operator account', async () => {
        jest.spyOn(repository, 'count').mockResolvedValue(0);
        jest.spyOn(repository, 'create').mockResolvedValue({ ...testingUser, permission: PermissionLevel.OPERATOR } as never);
        const defaultUser = await service.createDefaultUsers(false);

        expect(defaultUser).toMatchObject({
            permission: PermissionLevel.OPERATOR
        });
    });
});