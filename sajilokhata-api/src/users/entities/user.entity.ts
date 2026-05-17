import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Shop } from '../../shops/entities';
import { Sale } from '../../sales/entities';
import { Expense } from '../../expenses/entities';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    // Each user belongs to ONE shop
    @OneToOne(() => Shop, (shop) => shop.owner, {
        onDelete: "CASCADE",
        eager: true,
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

    @OneToMany(() => Expense, (expense) => expense.user)
    expenses: Expense[];

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}