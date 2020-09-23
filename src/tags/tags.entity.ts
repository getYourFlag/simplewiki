import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Article } from '../articles/articles.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    url: string;

    @Column("text", { default: null })
    description: string;

    @ManyToMany(type => Article, article => article.tags, { cascade: true })
    articles: Article[];

    @CreateDateColumn({ select: false })
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ select: false })
    deleted_at: Date;
}