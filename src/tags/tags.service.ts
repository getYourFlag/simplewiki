import { Injectable } from "@nestjs/common";
import { Connection, getRepository } from "typeorm";
import { TagsDto } from "./tags.dto";
import { Tag } from "./tags.entity";

@Injectable()
export class TagsService {
    private repository;

    constructor(private connection: Connection) {
        this.repository = getRepository(Tag);
    }

    public async getTagList(): Promise<Tag[]> {
        return await this.repository.find({
            select: ['name', 'url']
        });
    }

    public async getTagById(uuid: string): Promise<Tag> {
        return await this.repository.findOne(uuid);
    }

    public async getTagByUrl(url: string): Promise<Tag> {
        return await this.repository.findOne({ url });
    }

    public async createTag(data: TagsDto): Promise<Tag> {
        const newTag = this.repository.create(data);
        await this.repository.save(newTag);
        return newTag;
    }

    public async updateTag(uuid: string, data: TagsDto): Promise<Tag> {
        await this.repository.save(uuid, data);
        return await this.getTagById(uuid);
    }

    public async deleteTag(uuid: string): Promise<boolean> {
        await this.repository.softDelete(uuid);
        return true;
    }
}