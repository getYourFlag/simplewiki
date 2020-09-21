import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Article } from "../articles/articles.entity";
import { Suggestion } from "./suggestions.entity";
import { Connection, DeepPartial, getRepository, Repository } from "typeorm";
import { SuggestionDeleteConfirmationDto, SuggestionsDto } from "./suggestions.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateArticleDto } from "src/articles/articles.dto";

@Injectable()
export class SuggestionsService {
    constructor(
        private connection: Connection,
        @InjectRepository(Suggestion)
        private readonly suggestionRepository: Repository<Suggestion>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>
    ) {}

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
        const article = await this.articleRepository.findOne({
            where: { id: data.article }
        });
        if (!article) throw new HttpException('Binded article was not found', HttpStatus.NOT_FOUND);

        const suggestion = await this.suggestionRepository.preload({...data, article });
        return suggestion;
    }

    public async deleteSuggestion(uuid: string): Promise<SuggestionDeleteConfirmationDto> {
        const suggestion = await this.suggestionRepository.findOne(uuid);
        if (!suggestion) throw new HttpException('Suggestion not found', HttpStatus.NOT_FOUND);

        await this.suggestionRepository.softRemove(suggestion);

        return {
            id: suggestion.id
        }
    }
}