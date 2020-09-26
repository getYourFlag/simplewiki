import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { TagsModule } from './tags/tags.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { APP_FILTER } from '@nestjs/core';
import { EntityNotFoundFilter } from './common/exceptionHandlers/entityNotFound';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot(),
        UsersModule,
        AuthModule,
        ArticlesModule,
        TagsModule,
        SuggestionsModule
    ],

    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: EntityNotFoundFilter
        }
    ],
    exports: [],
})

export class AppModule {}
