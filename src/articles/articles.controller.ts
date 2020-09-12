import { Controller, Req, Post, Get, Param, HttpException, HttpStatus, Query, UseGuards, Body, Put, Delete } from '@nestjs/common';
import { PermissionLevel } from 'src/auth/auth.enum';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';
import { MinimumPermissionLevel } from 'src/auth/permission.decorator';
import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';

@Controller('articles')
export class ArticlesViewController {

    constructor(private service: ArticlesService) {}
    
    @Get()
    async getArticleList(@Req() req, @Query('page') page: number = 1) {
        if (!Number.isInteger(page) || page < 1) throw new HttpException('Invalid page number', HttpStatus.BAD_REQUEST);

        const permission = req.user?.permission || PermissionLevel.PUBLIC;
        return this.service.getArticlesList(permission, page);
    }

    @Get('id/:id')
    async getArticleById(@Req() req, @Param('id') uuid: string) {
        const permission = req.user?.permission || PermissionLevel.PUBLIC;
        return this.service.getArticleById(permission, uuid);
    }

    @Get(':url')
    async getArticleByUrl(@Req() req, @Param('url') url: string) {
        const permission = req.user?.permission || PermissionLevel.PUBLIC;
        return this.service.getArticleByUrl(permission, url);
    }

}

@Controller('articles')
@MinimumPermissionLevel(PermissionLevel.EDITOR)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ArticlesEditController {
    constructor(private service: ArticlesService) {}

    @Post()
    async createArticle(@Req() req, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.createArticle(data, req.user.id);
    }

    @Put(':id')
    async updateArticle(@Req() req, @Param('id') id: string, @Body() data: CreateArticleDto): Promise<Article> {
        return await this.service.updateArticle(id, data, req.user.id);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Delete(':id')
    async deleteArticle(@Param('id') id: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.deleteArticle(id);
    }

    @MinimumPermissionLevel(PermissionLevel.ADMIN)
    @Post('recover/:id')
    async recoverArticle(@Param('id') id: string): Promise<ArticleDeleteConfirmationDto> {
        return await this.service.recoverArticle(id);
    }
}