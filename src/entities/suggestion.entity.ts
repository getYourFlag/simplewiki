import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}