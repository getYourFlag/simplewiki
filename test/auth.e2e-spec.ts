import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { UsersService } from "../src/users/users.service";
import * as jwt_decode from 'jwt-decode';

describe('Users Module', () => {
    let app: INestApplication;
    
    beforeAll(async () => {

        // Creating nest application.
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    dropSchema: true,
                    synchronize: true,
                    entities: [ `${__dirname}/../src/**/*.entity.ts` ]
                }),
                UsersModule,
                AuthModule
            ],
        }).compile();
        app = moduleRef.createNestApplication();

        await app.select(UsersModule).get(UsersService).createDefaultUsers(false);
        await app.init();
    });

    afterAll(async () => {
        await getConnection().close();
    });

    it('returns 401 if username is incorrect', async () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: 'abc',
                password: 'abc'
            })
            .expect(401);
    });

    it('returns 403 if password is incorrect', async () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: 'DEFAULT',
                password: 'abc'
            })
            .expect(401);
    });

    it('returns a valid jwt if username and password are both correct', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: 'DEFAULT',
                password: 'DEFAULT'
            });
        expect(response.status).toBe(201);

        const token = jwt_decode(response.body.access_token);
        expect(token).toMatchObject({
            username: 'DEFAULT'
        });
    });
});