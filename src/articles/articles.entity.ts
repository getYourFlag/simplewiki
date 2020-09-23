import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, 
    DeleteDateColumn, BeforeInsert, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from '../tags/tags.entity';
import { User } from "../users/users.entity";
import { PermissionLevel } from '../auth/auth.enum';
import { randomBytes } from 'crypto';
import { Suggestion } from "../suggestions/suggestions.entity";

@Entity()
export class Article {

    @BeforeInsert()
    generateAttributes() {
        this.id = this.id || randomBytes(16).toString('hex');
        this.url = this.url || randomBytes(10).toString('hex'); 
    }

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    id: string;

    @Column()  
    title: string;

    @Column()
    url: string;

    @Column("text")
    content: string;

    @Column({ default: 1 })
    version: number;

    @Column("tinyint", { default: PermissionLevel.PUBLIC })
    permission: number;

    @Column("tinyint", { default: 0 })
    priority: number;

    @Column("boolean", { default: true })
    isActive: boolean;

    @Column("boolean", { default: false })
    isPinned: boolean;

    @ManyToMany(type => Tag, tag => tag.articles, { onDelete: "CASCADE" })
    @JoinTable()
    tags: Tag[];

    @OneToMany(type => Suggestion, suggestion => suggestion.article, { onDelete: 'NO ACTION' })
    suggestions: Suggestion[];

    @ManyToOne(type => User, user => user.articles)
    user: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}