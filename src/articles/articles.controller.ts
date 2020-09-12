import { Controller, Post, Get, Param, HttpException, HttpStatus, Query, UseGuards, Body, Put, Delete } from '@nestjs/common';

import { PermissionLevel } from 'src/auth/auth.enum';
import { MinimumPermissionLevel } from 'src/auth/auth.decorator';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/users.decorator';

import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';

@Controller('articles')
export class ArticlesViewController {

    constructor(private service: ArticlesService) {}
    
    @Get()
    async getArticleList(@User('permission') permission: number = PermissionLevel.PUBLIC, @Query('page') page: number = 1) {
        if (!Number.isInteger(page) || page < 1) throw new HttpException('Invalid page number', HttpStatus.BAD_REQUEST);

        return this.service.getArticlesList(permission, page);
    }

    @Get('id/:id')
    async getArticleById(@User('permission') permission: number = PermissionLevel.PUBLIC, @Param('id') uuid: string) {
        return this.service.getArticleById(permission, uuid);
    }

    @Get(':url')
    async getArticleByUrl(@User('permission') permission: number = PermissionLevel.PUBLIC, @Param('url') url: string) {
        return this.service.getArticleByUrl(permission, url);
    }

}

@Controller('articles')
@MinimumPermissionLevel(PermissionLevel.EDITOR)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ArticlesEditController {
    constructor(private service: ArticlesService) {}

    @Post()
    async createArticle(@User('id') userId: number, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.createArticle(data, userId);
    }

    @Put(':id')
    async updateArticle(@User('id') userId: number, @Param('id') articleId: string, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.updateArticle(articleId, data, userId);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Delete(':id')
    async deleteArticle(@Param('id') articleId: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.deleteArticle(articleId);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Post('recover/:id')
    async recoverArticle(@Param('id') articleId: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.recoverArticle(articleId);
    }
}