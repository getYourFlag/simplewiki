import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Tag } from './tag.entity';
import { ModifyTime } from './embedded/modifyTime.entity';
import { User } from "./user.entity";

@Entity()
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()  
    title: string;

    @Column()
    url: string;

    @Column("text")
    content: string;

    @Column()
    version: number;

    @Column("tinyint")
    visibility: number;

    @Column("boolean")
    isPinned: boolean;

    @ManyToMany(type => Tag, tag => tag.articles, { eager: true })
    @JoinTable()
    tags: Tag[];

    @ManyToOne(type => User, user => user.articles)
    user: User;

    @Column(type => ModifyTime)
    time: ModifyTime
}