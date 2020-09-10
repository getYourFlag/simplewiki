import { IsOptional, IsNotEmpty, IsInt, Min, Max, Length, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateArticleDto {

    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    url: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsInt()
    @Min(-127)
    @Max(127)
    permission: number;

    @IsOptional()
    @IsInt()
    @Min(-127)
    @Max(127)
    priority: number;

    @IsOptional()
    isPinned: boolean;

    @IsOptional()
    @IsUUID(4, {each: true})
    tags: Array<string>;

    @IsInt()
    user: number;
}