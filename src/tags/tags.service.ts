import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Article } from "src/articles/articles.entity";
import { Connection, getRepository, In } from "typeorm";
import { TagDeleteConfirmationDto, TagsDto } from "./tags.dto";
import { Tag } from "./tags.entity";

@Injectable()
export class TagsService {
    private tagRepository;
    private articleRepository;

    constructor(private connection: Connection) {
        this.tagRepository = getRepository(Tag);
        this.articleRepository = getRepository(Article);
    }

    public async getTagList(): Promise<Tag[]> {
        return await this.tagRepository.find({
            select: ['id', 'name', 'url']
        });
    }

    public async getTagById(uuid: string): Promise<Tag> {
        return await this.tagRepository.findOneOrFail(uuid);
    }

    public async getTagByUrl(url: string): Promise<Tag> {
        return await this.tagRepository.findOneOrFail({ url });
    }

    public async createTag(data: TagsDto): Promise<Tag> {
        const newTag = this.tagRepository.create(data);

        if (data.articles?.length > 0) {
            newTag.articles = await this.articleRepository.find({
                select: ['id', 'title', 'url'],
                where: { id: In(data.articles) }
            });
        }

        await this.tagRepository.save(newTag);
        return newTag;
    }

    public async updateTag(uuid: string, data: TagsDto): Promise<Tag> {
        const oldTag = await this.getTagById(uuid);
        if (!oldTag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);

        await this.tagRepository.update(uuid, data);

        // Update many-to-many relations to articles.
        if (data.articles?.length > 0) {
            const articles = await this.articleRepository.find({
                where:{
                    id: In(data.articles),
                    isActive: 1
                }
            });
            await this.tagRepository.createQueryBuilder()
                .relation(Tag, 'articles')
                .of(oldTag)
                .addAndRemove(oldTag.articles, articles);
        }

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