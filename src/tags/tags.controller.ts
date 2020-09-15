import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MinimumPermissionLevel } from 'src/auth/auth.decorator';
import { PermissionLevel } from 'src/auth/auth.enum';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';
import { TagsService } from './tags.service';
import { Tag } from './tags.entity';
import { TagDeleteConfirmationDto, TagsDto } from './tags.dto';

@Controller('tags')
export class TagsController {

    constructor(private service: TagsService) {}

    @Get()
    async getTagList(): Promise<Tag[]> {
        return await this.service.getTagList();
    }

    @Get('id/:id')
    async getTagById(@Param('id') id: string): Promise<Tag> {
        return await this.service.getTagById(id);
    }

    @Get('url/:url')
    async getTagByName(@Param('url') url: string): Promise<Tag> {
        return await this.service.getTagByUrl(url);
    }

}

@Controller('tags')
@MinimumPermissionLevel(PermissionLevel.EDITOR)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TagsAdminController {

    constructor(private service: TagsService) {}
    
    @Post()
    async createTag(@Body() data: TagsDto): Promise<Tag> {
        return await this.service.createTag(data);
    }

    @Put(':id')
    async updateTag(@Param('id') uuid: string, @Body() data: TagsDto): Promise<Tag> {
        return await this.service.updateTag(uuid, data);
    }

    @Delete(':id')
    async deleteTag(@Param('id') uuid: string): Promise<TagDeleteConfirmationDto> {
        return await this.service.deleteTag(uuid);
    }
}