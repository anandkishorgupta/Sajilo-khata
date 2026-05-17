import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";
import { Sale } from "../../sales/entities";
import { KhataTransaction } from "../../khata-transactions/entities";

@Entity("customers")
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.customers, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @Column()
    name: string;

   @Column({ nullable: true })
phone: string;

    @Column({
        nullable: true,
    })
    address: string;

    @OneToMany(() => Sale, (sale) => sale.customer)
    sales: Sale[];

    @OneToMany(() => KhataTransaction, (khata) => khata.customer)
    khataTransactions: KhataTransaction[];

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;
}