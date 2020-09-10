import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ArticlesViewController, ArticlesEditController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
    imports: [ AuthModule ],
    controllers: [ ArticlesViewController, ArticlesEditController ],
    providers: [ ArticlesService ]
})
export class ArticlesModule {}
