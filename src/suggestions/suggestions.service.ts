import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Article } from "../articles/articles.entity";
import { Suggestion } from "./suggestions.entity";
import { Repository } from "typeorm";
import { SuggestionDeleteConfirmationDto, SuggestionsDto } from "./suggestions.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class SuggestionsService {
    constructor(
        @InjectRepository(Suggestion)
        private readonly suggestionRepository: Repository<Suggestion>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>
    ) {}

    public async getAllSuggestions(page = 1): Promise<Suggestion[]> {
        return await this.suggestionRepository.find({
            relations: ['article'],
            skip: (page - 1) * 20,
            take: 20
        });
    }

    public async getArticleSuggestion(articleId: string, page = 1): Promise<Suggestion[]> {
        return await this.suggestionRepository.find({
            where: { articleId },
            relations: ['article'],
            skip: (page - 1) * 20,
            take: 20
        });
    }

    public async getSuggestion(uuid: string): Promise<Suggestion> {
        return await this.suggestionRepository.findOneOrFail(uuid, {
            relations: ['article'],
        });
    }

    public async submitSuggestion(data: SuggestionsDto): Promise<Suggestion> {
        const article = await this.articleRepository.findOneOrFail({
            where: { id: data.article }
        });

        const suggestion = this.suggestionRepository.create({ ...data, article });
        await this.suggestionRepository.save(suggestion);
        return suggestion;
    }

    public async deleteSuggestion(uuid: string): Promise<SuggestionDeleteConfirmationDto> {
        const suggestion = await this.suggestionRepository.findOneOrFail(uuid);
        
        await this.suggestionRepository.softRemove(suggestion);

        return {
            id: suggestion.id
        }
    }
}