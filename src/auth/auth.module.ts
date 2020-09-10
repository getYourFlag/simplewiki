import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [ 
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                return ({ 
                    secret: configService.get<string>('JWT_KEY'),
                    signOptions: {
                        expiresIn: '3h'
                    }
                })
            },
            inject: [ConfigService]
        }
    )],
    controllers: [ AuthController ],
    providers: [ AuthService, LocalStrategy, JwtStrategy ],
    exports: [ AuthService ]
})
export class AuthModule {}
