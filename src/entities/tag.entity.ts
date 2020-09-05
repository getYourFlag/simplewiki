import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Article } from './article.entity';
import { ModifyTime } from './embedded/modifyTime.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @ManyToMany(type => Article, article => article.tags)
    articles: Article[];

    @Column(type => ModifyTime)
    time: ModifyTime
}