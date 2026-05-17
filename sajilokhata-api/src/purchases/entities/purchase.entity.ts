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
import { User } from "../../users/entities";
import { PurchaseItem } from "./purchase-items.entity";

export type PurchaseStatus = "paid" | "partial" | "due";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  // =========================
  // RELATIONS
  // =========================
  @ManyToOne(() => Shop, (shop) => shop.purchases, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;


  // now not needed as we are not tracking which user created the purchase, there is only one user per shop
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  // =========================
  // SUPPLIER INFO
  // =========================
  @Column({
    name: "supplier_name",
    nullable: true,
  })
  supplierName: string;

  // =========================
  // BILL INFO
  // =========================
  @Column({
    name: "invoice_number",
    unique: true,
  })
  invoiceNumber: string;

  // =========================
  // AMOUNTS
  // =========================
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

  @Column({
    name: "due_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  dueAmount: number;

  // =========================
  // PAYMENT
  // =========================
  @Column({
    name: "payment_method",
    type: "varchar",
    default: "cash",
  })
  paymentMethod: string;

  @Column({
    name: "payment_status",
    type: "varchar",
    default: "paid",
  })
  paymentStatus: PurchaseStatus;

  // =========================
  // ITEMS
  // =========================
  @OneToMany(() => PurchaseItem, (item) => item.purchase, {
    cascade: true,
  })
  items: PurchaseItem[];

  // =========================
  // TIMESTAMP
  // =========================
  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;
}