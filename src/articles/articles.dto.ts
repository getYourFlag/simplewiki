import { IsOptional, IsEmpty, IsInt, Min, Max, IsString, MaxLength, IsUUID } from 'class-validator';

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

    @IsOptional()
    @IsInt()
    user: number;

    // These attributes are reserved for service internal use, not expected for appearing at API endpoint.
    @IsEmpty()
    id: string;

    @IsEmpty()
    version: number;
}

export class ArticleDeleteConfirmationDto {
    id: string;
    count: number;
}