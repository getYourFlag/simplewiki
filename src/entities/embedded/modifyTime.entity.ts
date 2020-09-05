import { Entity, Column } from 'typeorm';

@Entity()
export class ModifyTime {

    @Column("timestamp")
    created_at: number;

    @Column("timestamp")
    updated_at: number;

    @Column("timestamp")
    deleled_at: number;
    
}