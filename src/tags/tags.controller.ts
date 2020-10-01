import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MinimumPermissionLevel } from '../auth/auth.decorator';
import { PermissionLevel } from '../auth/auth.enum';
import { JwtAuthGuard, PermissionGuard } from '../auth/auth.guard';
import { TagsService } from './tags.service';
import { Tag } from './tags.entity';
import { TagDeleteConfirmationDto, TagsDto } from './tags.dto';

@Controller('tags')
export class TagsController {

    constructor(private service: TagsService) {}

    @Get()
    async getTagList(@Query('page') page: number = 1): Promise<Tag[]> {
        return await this.service.getTagList(page);
    }

    @Get('id/:id')
    async getTagById(@Param('id') id: string): Promise<Tag> {
        return await this.service.getTagById(id);
    }

    @Get('url/:url')
    async getTagByName(@Param('url') url: string): Promise<Tag> {
        return await this.service.getTagByUrl(url);
    }

    @Get('search/:text')
    async getTagBySearch(@Param('text') text: string, @Query('page') page: number = 1) {
        return await this.service.searchTag(text, page);
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