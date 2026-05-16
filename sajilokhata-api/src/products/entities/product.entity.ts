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
import { Shop } from '../../shops/entities';
import { SaleItem } from '../../sale-items/entities';
import { PurchaseItem } from '../../purchase-items/entities';
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

    @Column({ unique: true })
    sku: string; // SKU

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    imageFileId: string; // for delete/update later

    @Column({ nullable: true })
    barcode: string;

    @Column({ default: 'General' })
    category: string;

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