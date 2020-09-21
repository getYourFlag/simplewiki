import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('Unit test AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [ {
            provide: AuthService,
            useValue: {
              connection: jest.fn(),
              jwtService: jest.fn()
            }
          } ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /*
    it('should return null if the user password does not match', async () => {
        const user = {
            'id': 1,
            'username': 'test',
            'password': 'test',
            'permission': 1
        }
        jest.spyOn(service, 'authenticate')
    })
    */
});
