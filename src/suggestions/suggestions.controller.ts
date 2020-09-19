import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { MinimumPermissionLevel } from "src/auth/auth.decorator";
import { PermissionLevel } from "src/auth/auth.enum";
import { JwtAuthGuard, PermissionGuard } from "src/auth/auth.guard";
import { Suggestion } from "src/entities/suggestion.entity";
import { SuggestionDeleteConfirmationDto, SuggestionsDto } from "./suggestions.dto";
import { SuggestionsService } from "./suggestions.service";

@Controller('suggestions')
@MinimumPermissionLevel(PermissionLevel.USER)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SuggestionsSubmitController {
    constructor(private service: SuggestionsService) {}

    @Post()
    public async submitSuggestion(@Body() data: SuggestionsDto): Promise<Suggestion> {
        return await this.service.submitSuggestion(data);
    }

}

@Controller('suggestions')
@MinimumPermissionLevel(PermissionLevel.EDITOR)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SuggestionsController {
    constructor(private service: SuggestionsService) {}

    @Get()
    public async getSuggestionList(@Query('page') page = 1): Promise<Suggestion[]> {
        return await this.service.getAllSuggestions(page);
    }

    @Get('article/:id')
    public async getSuggestions(@Param('id') id: string, @Query('page') page = 1): Promise<Suggestion[]> {
        return await this.service.getArticleSuggestion(id, page);
    }

    @Get('id/:id')
    public async getSuggestion(@Param('id') uuid: string): Promise<Suggestion> {
        return await this.service.getSuggestion(uuid);
    }

    @Delete(':id')
    public async deleteSuggestion(@Param('id') uuid: string): Promise<SuggestionDeleteConfirmationDto> {
        return await this.service.deleteSuggestion(uuid);
    }

}