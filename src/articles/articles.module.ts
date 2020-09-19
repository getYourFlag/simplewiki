import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';
import { ArticlesViewController, ArticlesEditController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
    imports: [ AuthModule, TagsModule ],
    controllers: [ ArticlesViewController, ArticlesEditController ],
    providers: [ ArticlesService ]
})
export class ArticlesModule {}
