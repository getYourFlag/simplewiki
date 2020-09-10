import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Tag } from '../entities/tag.entity';
import { ModifyTime } from '../common/entities/modifyTime.entity';
import { User } from "../users/users.entity";
import { PermissionLevel } from 'src/auth/auth.enum';

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

    @Column({ default: 1 })
    version: number;

    @Column("tinyint", { default: PermissionLevel.PUBLIC })
    permission: number;

    @Column("tinyint", { default: 0 })
    priority: number;

    @Column("boolean", { default: false })
    isPinned: boolean;

    @ManyToMany(type => Tag, tag => tag.articles, { eager: true })
    @JoinTable()
    tags: Tag[];

    @ManyToOne(type => User, user => user.articles)
    user: User;

    @Column(type => ModifyTime)
    time: ModifyTime
}