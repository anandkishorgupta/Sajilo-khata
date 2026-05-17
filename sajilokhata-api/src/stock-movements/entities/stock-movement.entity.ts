

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Product } from "../../products/entities/product.entity";
import { Shop } from "../../shops/entities/shop.entity";

export type StockMovementType =
    | "in"
    | "out"
    | "adjust";

@Entity("stock_movements")
export class StockMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.stockMovements, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @ManyToOne(() => Product, (product) => product.stockMovements)
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column({
        type: "varchar",
    })
    type: StockMovementType;

    @Column()
    quantity: number;

    @Column({
        nullable: true,
    })
    referenceType: string; // sale, purchase, manual

    @Column({
        nullable: true,
    })
    referenceId: number;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;
}