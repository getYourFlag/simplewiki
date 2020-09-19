import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Connection, In, MoreThanOrEqual } from 'typeorm';
import { Article } from './articles.entity';
import { ConfigService } from '@nestjs/config';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';
import { TokenDto } from 'src/users/users.dto';
import { Tag } from 'src/tags/tags.entity';

const selectedColumns = ['id', 'uuid', 'title', 'url', 'content', 'created_at', 'updated_at'];

@Injectable()
export class ArticlesService {
    private articleRepository;
    private tagRepository;
    private articlesPerPage;

    constructor(
        connection: Connection,
        configService: ConfigService
    ) {
        this.articleRepository = connection.getRepository(Article);
        this.tagRepository = connection.getRepository(Tag);
        this.articlesPerPage = configService.get<number>('RECORDS_PER_PAGE');
    }

    public async getArticlesList(permission: number, page = 1): Promise<Article[]> {
        return await this.articleRepository.find({
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
        const article = await this.articleRepository.findOne({
            select: selectedColumns,
            where: {
                'id': id,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user', 'tag'],
            orderBy: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        return article;
    }

    public async getArticleByUrl(permission: number, url: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            select: selectedColumns,
            where: {
                'url': url,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user', 'tag'],
            orderBy: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        
        return article;
    }

    public async createArticle(data: CreateArticleDto, user: TokenDto): Promise<Article> {
        data.user = user.id;
        const newArticle = this.articleRepository.create(data);

        // Resolve user one-to-many relationship.
        newArticle.user = user.id;

        // Resolve tag many-to-many relationship.
        if (data.tags?.length > 0) {
            newArticle.tags = await this.tagRepository.find({
                select: [ 'id', 'name', 'url' ],
                where: { id: In(data.tags) }
            });
        }

        await this.articleRepository.save(newArticle);
        return newArticle;
    }

    public async updateArticle(articleId: string, data: CreateArticleDto, user: TokenDto): Promise<Article> {
        const oldArticle = await this.articleRepository.findOne({
            select: ['uuid', 'version'],
            where: {
                id: articleId,
                permission: MoreThanOrEqual(user.permission),
                isActive: true
            }
        });
        if (!oldArticle) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        const newArticle = this.articleRepository.create(data);
        // Modify attributes
        data.id = articleId;
        data.user = user.id;
        data.version = oldArticle.version += 1;

        if (data.tags?.length > 0) {
            newArticle.tags = await this.tagRepository.find({
                select: [ 'id', 'name', 'url' ],
                where: { id: In(data.tags) }
            });
        }

        oldArticle.isActive = false;

        await this.articleRepository.manager.transaction(async transactionalEntityManager => {
            await transactionalEntityManager.save(newArticle);
            await transactionalEntityManager.save(oldArticle);
        });

        return newArticle;
    }

    public async deleteArticle(articleId: string, user: TokenDto): Promise<ArticleDeleteConfirmationDto> {
        const articles = await this.articleRepository.find({
            where: { id: articleId, permission: MoreThanOrEqual(user.permission) }
        });
        if (!articles || !articles.length) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        await this.articleRepository.softRemove(articles);
        return {
            id: articleId,
            count: articles.length
        }
    }

    public async recoverArticle(articleId: string, user: TokenDto): Promise<ArticleDeleteConfirmationDto> {
        const dbResponse = await this.articleRepository.createQueryBuilder("articles")
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