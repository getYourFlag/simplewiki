import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { TagsModule } from './tags/tags.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

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
    providers: [AppService],
    exports: [],
})

export class AppModule {}
