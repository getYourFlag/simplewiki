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
        return await this.tagRepository.findOneOrFail(uuid, {
            relations: ['articles']
        });
    }

    public async getTagByUrl(url: string): Promise<Tag> {
        return await this.tagRepository.findOneOrFail({
            where: { url },
            relations: ['articles']
        });
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
        await this.getTagById(uuid); // Check if the tag to update was already existed.

        const { articles, ...updateData } = data;
        // Update many-to-many relations to articles.
        const newArticles = articles?.length > 0 ? await this.articleRepository.find({
            where: {
                id: In(data.articles),
                isActive: 1
            }
        }) : [];

        await this.tagRepository.save({ id: uuid, ...updateData, articles: newArticles });

        return await this.getTagById(uuid);
    }

    public async deleteTag(uuid: string): Promise<TagDeleteConfirmationDto> {
        await this.getTagById(uuid); // Check if the tag to delete was already existed.

        await this.tagRepository.softDelete(uuid);
        return {
            id: uuid
        };
    }

}