import { Length, IsString, IsUUID } from 'class-validator';
import { Article } from 'src/articles/articles.entity';
import { DeepPartial } from 'typeorm';

export class SuggestionsDto {
    @Length(1, 50)
    name: string;

    @IsString()
    content: string;

    @IsString()
    contact: string;

    @IsString()
    article: string;
}

export class SuggestionDeleteConfirmationDto {
    id: string;
}