import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/articles.entity';
import { SuggestionsController, SuggestionsSubmitController } from './suggestions.controller';
import { Suggestion } from './suggestions.entity';
import { SuggestionsService } from './suggestions.service';

@Module({
    imports: [ TypeOrmModule.forFeature([ Article, Suggestion ])],
    controllers: [ SuggestionsController, SuggestionsSubmitController ],
    providers: [ SuggestionsService ]
})
export class SuggestionsModule {}
