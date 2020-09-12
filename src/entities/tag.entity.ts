import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Article } from '../articles/articles.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @ManyToMany(type => Article, article => article.tags, { onDelete: "CASCADE" })
    articles: Article[];
}