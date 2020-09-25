import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/users.entity';
import { DeepPartial, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const testingUser: DeepPartial<User> = {
    id: 1,
    username: 'DEFAULT',
    password: 'DEFAULT',
    permission: 127
}

describe('Unit test AuthService', () => {
    jest.mock('bcrypt');

    let module: TestingModule;
    let service: AuthService;
    let repository: Repository<User>;
    let bcryptCompare: jest.Mock;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [ 
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository
                },
                {
                    provide: JwtService,
                    useValue: jest.fn()
                }
            ],
        }).compile();
    });

    beforeEach(async () => {
        bcryptCompare = jest.fn().mockResolvedValue(true);
        bcrypt.compare = bcryptCompare;

        service = module.get<AuthService>(AuthService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));

        jest.spyOn(repository, 'findOne').mockResolvedValue(testingUser as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return null if the user does not exist', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);

        expect(await service.authenticate('username', 'password')).toBeNull();
    })

    it('should return null if the password is incorrect', async () => {
        bcryptCompare.mockResolvedValue(false);

        expect(await service.authenticate('DEFAULT', 'password')).toBeNull();
    });

    it('should return the user if successfully logged in', async () => {
        jest.spyOn(repository, 'update').mockResolvedValue(true as any);

        const returnedUser = await service.authenticate(testingUser.username, testingUser.password);
        expect(returnedUser).toMatchObject(testingUser);
    });

    it('should update the last login date if successfully logged in', async () => {
      // Setup mock functions.
      const updateFunction = jest.spyOn(repository, 'update');
      updateFunction.mockResolvedValue(true as any);

      await service.authenticate('DEFAULT', 'DEFAULT');
      expect(updateFunction).toHaveBeenCalled();
  });
});
