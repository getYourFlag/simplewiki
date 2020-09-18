import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';

@Module({
    providers: [ SuggestionsService ]
})
export class SuggestionsModule {}
