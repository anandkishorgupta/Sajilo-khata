// =========================================
// PURCHASE ENTITY
// src/purchases/entities/purchase.entity.ts
// =========================================

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
import { PurchaseItem } from "../../purchase-items/entities";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop, (shop) => shop.purchases, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @Column({
    name: "supplier_name",
  })
  supplierName: string;

  @Column({
    name: "total_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  totalAmount: number;

  @Column({
    name: "paid_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  paidAmount: number;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, {
    cascade: true,
  })
  items: PurchaseItem[];

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;
}