import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Article } from './articles.entity';
import { ConfigService } from '@nestjs/config';
import { CreateArticleDto } from './articles.dto';

@Injectable()
export class ArticlesService {
    private repository;
    private queryBuilder;
    private articlesPerPage;

    constructor(
        connection: Connection,
        configService: ConfigService
    ) {
        this.repository = connection.getRepository(Article);
        this.queryBuilder = this.repository.createQueryBuilder("article");
        this.articlesPerPage = configService.get<Number>('RECORDS_PER_PAGE');
    }

    public async getArticlesList(permission: number, page: number = 1): Promise<Article[]> {
        const articles = await this.queryBuilder
            .where('permission >= :permission', { permission })
            .andWhere('isActive = 1')
            .leftJoinAndSelect('article.user', 'user.nick')
            .orderBy('priority', 'DESC')
            .orderBy('id', 'DESC')
            .skip((page - 1) * this.articlesPerPage)
            .take(this.articlesPerPage)
            .getMany();
        return articles;
    }

    public async getArticleByUuid(permission: number, uuid: string): Promise<Article> {
        const article = await this.queryBuilder
            .where("uuid = :uuid", { uuid })
            .andWhere('isActive = 1')
            .leftJoinAndSelect('article.user', 'user.nick')
            .getOne();
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        if (article.permission > permission) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        return article;
    }

    public async getArticleByUrl(permission: number, url: string): Promise<Article> {
        const article = await this.queryBuilder
            .where('url = :url', { url })
            .andWhere('isActive = 1')
            .leftJoinAndSelect('article.user', 'user.nick')
            .getOne();
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        if (article.permission > permission) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        return article;
    }

    public async createArticle(data: CreateArticleDto, userId: number): Promise<Article> {
        data.user = userId;
        const newArticle = await this.repository.insert(data);
        console.log(newArticle);
        return newArticle;
    }
}