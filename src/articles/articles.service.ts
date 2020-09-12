import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Connection, MoreThanOrEqual, Raw } from 'typeorm';
import { Article } from './articles.entity';
import { ConfigService } from '@nestjs/config';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';
import { TokenDto } from 'src/users/users.dto';

const selectedColumns = ['id', 'uuid', 'title', 'url', 'content', 'created_at', 'updated_at'];

@Injectable()
export class ArticlesService {
    private repository;
    private articlesPerPage;

    constructor(
        connection: Connection,
        configService: ConfigService
    ) {
        this.repository = connection.getRepository(Article);
        this.articlesPerPage = configService.get<Number>('RECORDS_PER_PAGE');
    }

    public async getArticlesList(permission: number, page: number = 1): Promise<Article[]> {
        return await this.repository.find({
            select: selectedColumns,
            where: {
                permission: MoreThanOrEqual(permission),
                isActive: 1
            },
            relations: ['user'],
            orderBy: {
                priority: 'DESC',
                uuid: 'DESC'
            },
            skip: (page - 1) * this.articlesPerPage,
            take: this.articlesPerPage
        });
    }

    public async getArticleById(permission: number, id: string): Promise<Article> {
        const article = await this.repository.findOne({
            select: selectedColumns,
            where: {
                'id': id,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user'],
            orderBy: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        return article;
    }

    public async getArticleByUrl(permission: number, url: string): Promise<Article> {
        const article = await this.repository.findOne({
            select: selectedColumns,
            where: {
                'url': url,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user'],
            orderBy: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        
        return article;
    }

    public async createArticle(data: CreateArticleDto, user: TokenDto): Promise<Article> {
        // Relate article to user.
        data.user = user.id;

        const newArticle = this.repository.create(data);
        await this.repository.save(newArticle);
        return newArticle;
    }

    public async updateArticle(articleId: string, data: CreateArticleDto, user: TokenDto): Promise<Article> {
        const oldArticle = await this.repository.findOne({
            select: ['uuid', 'version'],
            where: {
                id: articleId,
                permission: MoreThanOrEqual(user.permission),
                isActive: true
            }
        });
        if (!oldArticle) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        // Modify attributes 
        data.id = articleId;
        data.user = user.id;
        data.version = oldArticle.version += 1;
        oldArticle.isActive = false;

        const newArticle = this.repository.create(data);

        await this.repository.manager.transaction("REPEATABLE READ", async transactionalEntityManager => {
            await transactionalEntityManager.save(newArticle);
            await transactionalEntityManager.save(oldArticle);
        });

        return newArticle;
    }

    public async deleteArticle(articleId: string, user: TokenDto): Promise<ArticleDeleteConfirmationDto> {
        const articles = await this.repository.find({
            where: { id: articleId, permission: MoreThanOrEqual(user.permission) }
        });
        if (!articles || !articles.length) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        await this.repository.softRemove(articles);
        return {
            id: articleId,
            count: articles.length
        }
    }

    public async recoverArticle(articleId: string, user: TokenDto): Promise<ArticleDeleteConfirmationDto> {
        const dbResponse = await this.repository.createQueryBuilder("articles")
            .where("id = :id", { id: articleId })
            .andWhere("permission >= :permission", { permission: user.permission })
            .restore()
            .execute();

        return {
            id: articleId,
            count: dbResponse.raw.changedRows
        }
    }
}