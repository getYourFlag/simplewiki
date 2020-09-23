import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { In, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { Article } from './articles.entity';
import { ConfigService } from '@nestjs/config';
import { ArticleDeleteConfirmationDto, CreateArticleDto } from './articles.dto';
import { TokenDto } from '../users/users.dto';
import { Tag } from '../tags/tags.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

@Injectable()
export class ArticlesService {
    private articlesPerPage;

    constructor(
        configService: ConfigService,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
        this.articlesPerPage = configService.get<number>('RECORDS_PER_PAGE');
    }

    public async getArticlesList(permission: number, page = 1): Promise<Article[]> {
        return await this.articleRepository.find({
            select: ['id', 'uuid', 'title', 'url', 'priority', 'content', 'created_at', 'updated_at'],
            where: {
                permission: MoreThanOrEqual(permission),
                isActive: 1
            },
            relations: ['user'],
            order: {
                priority: 'DESC',
                uuid: 'DESC'
            },
            skip: (page - 1) * this.articlesPerPage,
            take: this.articlesPerPage
        });
    }

    public async getArticleById(permission: number, id: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            select: ['id', 'uuid', 'title', 'url', 'priority', 'content', 'created_at', 'updated_at'],
            where: {
                'id': id,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user', 'tag'],
            order: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

        return article;
    }

    public async getArticleByUrl(permission: number, url: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            select: ['id', 'uuid', 'title', 'url', 'priority', 'content', 'created_at', 'updated_at'],
            where: {
                'url': url,
                'permission': MoreThanOrEqual(permission),
                'isActive': 1
            },
            relations: ['user', 'tag'],
            order: { 'version': 'DESC' },
        });
        if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        
        return article;
    }

    public async createArticle(data: CreateArticleDto, userData: TokenDto): Promise<Article> {
        const user = await this.userRepository.findOne(userData.id);
        const tags = data.tags?.length > 0 ? await this.tagRepository.find({
            select: [ 'id', 'name', 'url' ],
            where: { id: In(data.tags) }
        }) : null;
        const newArticle = this.articleRepository.create({ ...data, user, tags });

        await this.articleRepository.save(newArticle);
        return newArticle;
    }

    public async updateArticle(articleId: string, data: CreateArticleDto, userData: TokenDto): Promise<Article> {
        
        // Retrieve & Modify old article.
        const oldArticle = await this.articleRepository.findOne({
            where: {
                id: articleId,
                permission: LessThanOrEqual(userData.permission),
                isActive: true
            }
        });
        if (!oldArticle) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        oldArticle.isActive = false;

        // Compose the new article.
        const tags = data.tags?.length > 0 ? await this.tagRepository.find({
            select: [ 'id', 'name', 'url' ],
            where: { id: In(data.tags) }
        }): null;
        const user = await this.userRepository.findOne(userData.id);
        const newArticle = this.articleRepository.create({ 
            ...data, 
            user, 
            tags,
            id: articleId,
            version: oldArticle.version += 1
        });

        // Updates both old article and new article with DB transaction.
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