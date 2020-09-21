import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from 'src/tags/tags.entity';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';
import { ArticlesViewController, ArticlesEditController } from './articles.controller';
import { Article } from './articles.entity';
import { ArticlesService } from './articles.service';

@Module({
    imports: [ 
        AuthModule, 
        TagsModule, 
        TypeOrmModule.forFeature([ Tag, Article ]) 
    ],
    controllers: [ ArticlesViewController, ArticlesEditController ],
    providers: [ ArticlesService ]
})
export class ArticlesModule {}
