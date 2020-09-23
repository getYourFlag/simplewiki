import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Article } from "../articles/articles.entity";
import { In, Repository } from "typeorm";
import { TagDeleteConfirmationDto, TagsDto } from "./tags.dto";
import { Tag } from "./tags.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TagsService {

    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>
    ) {
    }

    public async getTagList(): Promise<Tag[]> {
        return await this.tagRepository.find({
            select: ['id', 'name', 'url']
        });
    }

    public async getTagById(uuid: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne(uuid, {
            relations: ['articles']
        });
        if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
        return tag;
    }

    public async getTagByUrl(url: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne({
            where: { url },
            relations: ['articles']
        });
        if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
        return tag;
    }

    public async createTag(data: TagsDto): Promise<Tag> {
        const articles = data.articles?.length > 0 ? 
            await this.articleRepository.find({
                select: ['id', 'title', 'url'],
                where: { id: In(data.articles) }
            }) 
            : null;

        const newTag = this.tagRepository.create({ ...data, articles });

        await this.tagRepository.save(newTag);
        return newTag;
    }

    public async updateTag(uuid: string, data: TagsDto): Promise<Tag> {
        const tag = await this.getTagById(uuid);
        if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);

        const { articles, ...updateData } = data;
        // Update many-to-many relations to articles.
        const newArticles = articles?.length > 0 ? await this.articleRepository.find({
            where: {
                id: In(data.articles),
                isActive: 1
            }
        }) : [];

        await this.tagRepository.update(uuid, { ...updateData, articles: newArticles });

        return await this.getTagById(uuid);
    }

    public async deleteTag(uuid: string): Promise<TagDeleteConfirmationDto> {
        const oldTag = await this.getTagById(uuid);
        if (!oldTag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);

        await this.tagRepository.softDelete(uuid);
        return {
            id: uuid
        };
    }

}