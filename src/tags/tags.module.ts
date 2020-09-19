import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TagsAdminController, TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
    imports: [ AuthModule ],
    controllers: [ TagsController, TagsAdminController ],
    providers: [ TagsService ],
    exports: [ TagsService ]
})
export class TagsModule {}
