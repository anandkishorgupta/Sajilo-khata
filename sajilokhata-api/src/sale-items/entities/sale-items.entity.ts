import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Product } from "../../products/entities/product.entity";
import { Sale } from "../../sales/entities";

@Entity("sale_items")
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (sale) => sale.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sale_id" })
  sale: Sale;

  @ManyToOne(() => Product, (product) => product.saleItems)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column()
  quantity: number;

  @Column({
    name: "unit_price",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    name: "purchase_price",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  purchasePrice: number;

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
  })
  profit: number;
}