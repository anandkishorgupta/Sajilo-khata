import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities';
import { PurchaseItem } from '../../purchases/entities';
import { SaleItem } from '../../sales/entities';
import { Shop } from '../../shops/entities';
import { StockMovement } from '../../stock-movements/entities';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column()
    name: string;

    // @Column()
    // sku: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    imageFileId: string; // for delete/update later

    @Column({ nullable: true })
    barcode: string;

    // @Column({ default: 'General' })
    // category: string;

    @ManyToOne(() => Category, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    purchasePrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    sellingPrice: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'int', default: 5 })
    lowStockLimit: number;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
    saleItems: SaleItem[];

    @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.product)
    purchaseItems: PurchaseItem[];

    @OneToMany(() => StockMovement, (movement) => movement.product)
    stockMovements: StockMovement[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}