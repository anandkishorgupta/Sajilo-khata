// =========================================
// PURCHASE ITEM ENTITY
// src/purchases/entities/purchase-item.entity.ts
// =========================================

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Product } from "../../products/entities/product.entity";
import { Purchase } from ".";

@Entity("purchase_items")
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "purchase_id" })
  purchase: Purchase;

  @ManyToOne(() => Product, (product) => product.purchaseItems)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column()
  quantity: number;

  @Column({
    name: "cost_price",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  costPrice: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  unitPrice: number;


  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  subtotal: number;
}