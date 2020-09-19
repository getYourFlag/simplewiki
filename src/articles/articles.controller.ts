import { Controller, Post, Get, Param, HttpException, HttpStatus, Query, UseGuards, Body, Put, Delete } from '@nestjs/common';

import { PermissionLevel } from '../auth/auth.enum';
import { MinimumPermissionLevel } from '../auth/auth.decorator';
import { JwtAuthGuard, PermissionGuard } from '../auth/auth.guard';
import { User } from '../users/users.decorator';

import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';

@Controller('articles')
export class ArticlesViewController {

    constructor(private service: ArticlesService) {}
    
    @Get()
    async getArticleList(@User('permission') permission: number = PermissionLevel.PUBLIC, @Query('page') page = 1) {
        if (!Number.isInteger(page) || page < 1) throw new HttpException('Invalid page number', HttpStatus.BAD_REQUEST);

        return this.service.getArticlesList(permission, page);
    }

    @Get('id/:id')
    async getArticleById(@User('permission') permission: number = PermissionLevel.PUBLIC, @Param('id') uuid: string) {
        return this.service.getArticleById(permission, uuid);
    }

    @Get('url/:url')
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
    async createArticle(@User('id') user, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.createArticle(data, user);
    }

    @Put('id/:id')
    async updateArticle(@User('id') user, @Param('id') articleId: string, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.updateArticle(articleId, data, user);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Delete('id/:id')
    async deleteArticle(@User() user, @Param('id') articleId: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.deleteArticle(articleId, user);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Post('recover/:id')
    async recoverArticle(@User() user, @Param('id') articleId: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.recoverArticle(articleId, user);
    }
}