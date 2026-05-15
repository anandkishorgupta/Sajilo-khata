import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Shop } from '../../shops/entities';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    // Each user belongs to ONE shop
    @OneToOne(() => Shop, (shop) => shop.owner, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}