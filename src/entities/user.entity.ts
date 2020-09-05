import { Entity, PrimaryGeneratedColumn, OneToMany, Column, CreateDateColumn } from "typeorm";
import { Article } from "./article.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column("tinyint")
    permission: number;

    @OneToMany(type => Article, article => article.user)
    articles: Article[];

    @CreateDateColumn("timestamp")
    created_at: number;

    @Column("timestamp")
    last_login: number;
}