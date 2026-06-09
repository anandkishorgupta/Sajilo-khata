import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";

@Entity("expenses")
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.expenses, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @Column()
    title: string;

    @Column({
        type: "decimal",
        precision: 12,
        scale: 2,
    })
    amount: number;

    @Column({
        nullable: true,
    })
    category: string;

    @Column({
        type: "text",
        nullable: true,
    })
    note: string;

    @Column({
        type: "date",
        nullable: true,
    })
    date: string;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;
}