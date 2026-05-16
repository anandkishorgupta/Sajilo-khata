

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";
import { Customer } from "../../customers/entities/customer.entity";

export type KhataType = "credit" | "payment";

@Entity("khata_transactions")
export class KhataTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop, (shop) => shop.khataTransactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @ManyToOne(() => Customer, (customer) => customer.khataTransactions)
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({
    type: "varchar",
  })
  type: KhataType;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column({
    nullable: true,
  })
  note: string;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;
}