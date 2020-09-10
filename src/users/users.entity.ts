import { Entity, PrimaryGeneratedColumn, OneToMany, Column, CreateDateColumn } from "typeorm";
import { Article } from "../articles/articles.entity";
import { ModifyTime } from "../common/entities/modifyTime.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ unique: true})
    nick: string;

    @Column("tinyint", { default: 1 })
    permission: number;

    @OneToMany(type => Article, article => article.user)
    articles: Article[];

    @Column({ default: null })
    last_login: Date;

    @Column(type => ModifyTime)
    time: ModifyTime
}