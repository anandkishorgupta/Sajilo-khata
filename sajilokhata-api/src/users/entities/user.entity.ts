import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Sale } from '../../sales/entities';
import { Shop } from '../../shops/entities';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.users, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', default: 'owner' })
    role: 'owner' | 'staff';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}