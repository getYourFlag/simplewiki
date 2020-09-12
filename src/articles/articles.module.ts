import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TagsModule } from 'src/tags/tags.module';
import { ArticlesViewController, ArticlesEditController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
    imports: [ AuthModule, TagsModule ],
    controllers: [ ArticlesViewController, ArticlesEditController ],
    providers: [ ArticlesService ]
})
export class ArticlesModule {}
