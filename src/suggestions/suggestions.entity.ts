import { Article } from "src/articles/articles.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Suggestion {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    content: string;

    @Column()
    contact: string;

    @ManyToOne(type => Article, { onDelete: 'CASCADE' })
    article: Article;

    @CreateDateColumn()
    created_at: Date

    @DeleteDateColumn()
    deleted_at: Date
}