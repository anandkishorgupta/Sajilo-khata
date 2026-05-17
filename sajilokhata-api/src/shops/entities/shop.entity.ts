import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
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

export type PlanType = 'trial' | 'basic' | 'pro';
export type ShopStatus = 'trial' | 'active' | 'expired';

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

    @OneToOne(() => User, (user) => user.shop)
    owner: User;

    @OneToMany(() => Product, (product) => product.shop)
    products: Product[];

    @Column({ type: 'varchar', default: 'trial' })
    plan: PlanType;

    @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
    trialEndsAt: Date;

    @Column({ name: 'subscription_end', type: 'timestamp', nullable: true })
    subscriptionEnd: Date;

    @Column({ type: 'varchar', default: 'trial' })
    status: ShopStatus;


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