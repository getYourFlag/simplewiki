import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ModifyTime } from './embedded/modifyTime.entity';

@Entity()
export class Suggestion {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()  
    title: string;

    @Column("text")
    content: string;

    @Column()
    contact: string;

    @Column("boolean")
    visible: boolean;

    @Column(type => ModifyTime)
    time: ModifyTime
}