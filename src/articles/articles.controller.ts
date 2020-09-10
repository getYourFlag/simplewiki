import { Controller, Req, Post, Get, Param, HttpException, HttpStatus, Query, UseGuards, Body } from '@nestjs/common';
import { PermissionLevel } from 'src/auth/auth.enum';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';
import { MinimumPermissionLevel } from 'src/auth/permission.decorator';
import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { CreateArticleDto } from './articles.dto';

@Controller('articles')
export class ArticlesViewController {

    constructor(private service: ArticlesService) {}
    
    @Get()
    async getArticleList(@Req() req, @Query('page') page: number = 0) {
        if (!Number.isInteger(page)) throw new HttpException('Invalid page number', HttpStatus.BAD_REQUEST);

        const permission = req.user?.permission || PermissionLevel.PUBLIC;
        return this.service.getArticlesList(permission, page);
    }

    @Get('id/:uuid')
    async getArticleByUuid(@Req() req, @Param('uuid') uuid: string) {
        const permission = req.user?.permission || PermissionLevel.PUBLIC;
        return this.service.getArticleByUuid(permission, uuid);
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
}