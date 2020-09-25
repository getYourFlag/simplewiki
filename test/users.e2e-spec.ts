import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { UsersService } from "../src/users/users.service";
import { AuthService } from "../src/auth/auth.service";

describe('Users Module', () => {
    let app: INestApplication;
    let defaultUserId: number;
    let newUserId: number;
    let newUserToken: string;
    
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

        /* 
            Creates two user to test for permission & authentication.
            Service methods were directly called to prevent repeated testing of controller logic.
        */
        const defaultUser = await app.select(UsersModule).get(UsersService).createDefaultUsers(false);
        const newUser = await app.select(UsersModule).get(UsersService).createUser({
            username: 'newuser',
            password: 'newuser',
            nick: 'New User',
            permission: 1
        });
        defaultUserId = defaultUser.id;
        newUserId = newUser.id;

        /*
            Stores the access token for new user.
        */
        const newUserAuthResponse = await app.select(AuthModule).get(AuthService).generateToken({
            id: newUser.id,
            username: 'newuser',
            permission: 1
        } as any);
        newUserToken = newUserAuthResponse.access_token;

        // Launch application.
        await app.init();
    });

    afterAll(async () => {
        await getConnection().close();
    });

    it('gets information about default user', async () => {
        const response = await request(app.getHttpServer()).get('/users/1');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            username: 'DEFAULT',
            nick: 'DEFAULT ADMIN',
            permission: 127
        });
    });

    it('register new user', async () => {
        const user = {
            username: 'new',
            password: 'new',
            nick: 'test registration'
        }
        const response = await request(app.getHttpServer())
            .post('/users')
            .send(user);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            username: user.username,
            nick: user.nick
        });
    });

    it('prevents guests from updating users', async () => {
        await request(app.getHttpServer())
            .put('/users/1')
            .send({})
            .expect(401);
    });

    it('prevents guests from deleting users', async () => {
        await request(app.getHttpServer())
            .delete('/users/1')
            .send({})
            .expect(401);
    });

    it('prevents guests from creating users', async () => {
        await request(app.getHttpServer())
            .post('/admin/users')
            .send({})
            .expect(401);
    });

    it('Cannot update other users\' information', async () => {
        const response = await request(app.getHttpServer())
            .put(`/users/${defaultUserId}`)
            .set('Authorization', 'Bearer ' + newUserToken)
            .send({
                username: 'newuser',
                password: 'newuser',
                nick: 'new user modified',
            });
        expect(response.status).toBe(403);
    });

    it('Cannot update users\' information when password is not provided', async () => {
        const response = await request(app.getHttpServer())
            .put(`/users/${newUserId}`)
            .set('Authorization', 'Bearer ' + newUserToken)
            .send({
                username: 'newuser',
                nick: 'new user modified',
            });
        expect(response.status).toBe(400);
    });

    it('Cannot update users\' information when password is incorrect', async () => {
        const response = await request(app.getHttpServer())
            .put(`/users/${newUserId}`)
            .set('Authorization', 'Bearer ' + newUserToken)
            .send({
                username: 'newuser',
                password: 'wrongpassword',
                nick: 'new user modified',
            });
        expect(response.status).toBe(403);
    });
    
    it('Can update own user information', async() => {
        const response = await request(app.getHttpServer())
            .put(`/users/${newUserId}`)
            .set('Authorization', 'Bearer ' + newUserToken)
            .send({
                username: 'newuser',
                password: 'newuser',
                nick: 'new user modified',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            username: 'newuser',
            nick: 'new user modified'
        });
    });

    it('Cannot delete other users', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/users/${defaultUserId}`)
            .set('Authorization', `Bearer ${newUserToken}`)
            .send();
        expect(response.status).toBe(403);
    });

    it('Can delete own account', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/users/${newUserId}`)
            .set('Authorization', `Bearer ${newUserToken}`)
            .send({
                password: 'newuser'
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: String(newUserId),
            username: 'newuser'
        });
    });
});