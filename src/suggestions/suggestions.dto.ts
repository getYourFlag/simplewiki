import { Length, IsString } from 'class-validator';

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