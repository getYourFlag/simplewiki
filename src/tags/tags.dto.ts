import { IsOptional, Length, IsString, IsUUID, ArrayUnique, IsArray } from 'class-validator';

export class TagsDto {
    @Length(1, 50)
    name: string;

    @Length(1, 50)
    url: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    articles: Array<string>;
}