import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export class ModifyTime {

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleled_at: Date;
    
}