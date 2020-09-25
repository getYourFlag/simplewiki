import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/articles.entity';
import { AuthModule } from '../auth/auth.module';
import { TagsAdminController, TagsController } from './tags.controller';
import { Tag } from './tags.entity';
import { TagsService } from './tags.service';

@Module({
    imports: [ AuthModule, TypeOrmModule.forFeature([ Tag, Article ]) ],
    controllers: [ TagsController, TagsAdminController ],
    providers: [ TagsService ],
    exports: [ TagsService ]
})
export class TagsModule {}
