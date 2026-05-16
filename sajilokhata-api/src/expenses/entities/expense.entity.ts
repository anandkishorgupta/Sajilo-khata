import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";
import { User } from "../../users/entities/user.entity";

@Entity("expenses")
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.expenses, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @ManyToOne(() => User, (user) => user.expenses)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    title: string;

    @Column({
        type: "decimal",
        precision: 12,
        scale: 2,
    })
    amount: number;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;
}