import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";
import { User } from "../../users/entities/user.entity";
import { Customer } from "../../customers/entities";
import { SaleItem } from "../../sale-items/entities";

export type PaymentMethod =
  | "cash"
  | "qr"
  | "bank"
  | "credit"
  | "mixed";

export type PaymentStatus =
  | "paid"
  | "partial"
  | "due";

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  // =========================
  // RELATIONS
  // =========================

  @ManyToOne(() => Shop, (shop) => shop.sales, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @ManyToOne(() => User, (user) => user.sales, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.sales, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, {
    cascade: true,
  })
  items: SaleItem[];

  // =========================
  // SALE INFO
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
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  discount: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  tax: number;

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
  paymentMethod: PaymentMethod;

  @Column({
    name: "payment_status",
    type: "varchar",
    default: "paid",
  })
  paymentStatus: PaymentStatus;

  // =========================
  // EXTRA
  // =========================

  @Column({
    type: "text",
    nullable: true,
  })
  note?: string;

  // =========================
  // TIMESTAMPS
  // =========================

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;
}