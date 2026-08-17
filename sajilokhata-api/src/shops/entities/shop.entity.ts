import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities';
import { Expense } from '../../expenses/entities';
import { KhataTransaction } from '../../khata-transactions/entities';
import { Product } from '../../products/entities';
import { Purchase } from '../../purchases/entities';
import { Sale } from '../../sales/entities';
import { StockMovement } from '../../stock-movements/entities';
import { User } from '../../users/entities';


@Entity('shops')
export class Shop {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @OneToMany(() => User, (user) => user.shop)
    users: User[];

    @OneToMany(() => Product, (product) => product.shop)
    products: Product[];

    @Column({
        type: 'varchar',
        default: 'trial',
    })
    plan: 'trial' | 'pro';

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    expiresAt: Date;

    @OneToMany(() => Customer, (customer) => customer.shop)
    customers: Customer[];

    @OneToMany(() => Sale, (sale) => sale.shop)
    sales: Sale[];

    @OneToMany(() => Purchase, (purchase) => purchase.shop)
    purchases: Purchase[];

    @OneToMany(() => Expense, (expense) => expense.shop)
    expenses: Expense[];

    @OneToMany(() => StockMovement, (stock) => stock.shop)
    stockMovements: StockMovement[];

    @OneToMany(() => KhataTransaction, (khata) => khata.shop)
    khataTransactions: KhataTransaction[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}