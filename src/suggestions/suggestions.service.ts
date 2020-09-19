import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Article } from "src/articles/articles.entity";
import { Suggestion } from "src/entities/suggestion.entity";
import { Connection, getRepository, In } from "typeorm";
import { SuggestionDeleteConfirmationDto, SuggestionsDto } from "./suggestions.dto";

@Injectable()
export class SuggestionsService {
    private suggestionRepository;
    private articleRepository;

    constructor(private connection: Connection) {
        this.suggestionRepository = getRepository(Suggestion);
        this.articleRepository = getRepository(Article);
    }

    public async getAllSuggestions(page = 1): Promise<Suggestion[]> {
        return await this.suggestionRepository.find({
            skip: (page - 1) * 20,
            take: 20
        });
    }

    public async getArticleSuggestion(articleId: string, page = 1): Promise<Suggestion[]> {
        return await this.suggestionRepository.find({
            where: { articleId },
            skip: (page - 1) * 20,
            take: 20
        });
    }

    public async getSuggestion(uuid: string): Promise<Suggestion> {
        return await this.suggestionRepository.findOne(uuid);
    }

    public async submitSuggestion(data: SuggestionsDto): Promise<Suggestion> {
        const suggestion = this.suggestionRepository.create(data);
        suggestion.article = this.articleRepository.findOne({
            where: { id: data.article }
        });

        await this.suggestionRepository.save(suggestion);
        return suggestion;
    }

    public async deleteSuggestion(uuid: string): Promise<SuggestionDeleteConfirmationDto> {
        const suggestion = this.suggestionRepository.findOne(uuid);
        if (!suggestion) throw new HttpException('Suggestion not found', HttpStatus.NOT_FOUND);

        await this.suggestionRepository.softRemove(suggestion);

        return {
            id: suggestion.id
        }
    }
}