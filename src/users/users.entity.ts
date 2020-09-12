import { Entity, PrimaryGeneratedColumn, OneToMany, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Article } from "../articles/articles.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, select: false })
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ unique: true })
    nick: string;

    @Column("tinyint", { default: 1 })
    permission: number;

    @OneToMany(type => Article, article => article.user)
    articles: Article[];

    @Column({ default: null, select: false })
    last_login: Date;

    @CreateDateColumn({ select: false })
    created_at: Date;

    @UpdateDateColumn({ select: false })
    updated_at: Date;

    @DeleteDateColumn({ select: false })
    deleted_at: Date;
}