import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user_historial')
export class UserHistorial {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number; // Referencia al ID del usuario

    @Column()
    accion!: string; // CREATE, UPDATE, DELETE 

    // Se almacena el objeto con los campos que cambiaron 
    @Column({ type: 'json' })
    cambios: any;

    @CreateDateColumn()
    timestamp!: Date;
}