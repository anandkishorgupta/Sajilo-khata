import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shop } from "../../shops/entities";

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop)
  shop: Shop;

  @Column({ unique: true })
  pidx: string; // Khalti's payment ID

  @Column({ type: 'decimal' })
  amount: number; // in paisa (Rs 999 = 99900 paisa)

  @Column({ default: 'pending' }) // pending | completed | failed
  status: string;

  @Column({ nullable: true })
  transactionId: string; // from Khalti after verification

  @Column()
purchaseOrderId: string;

  @CreateDateColumn()
  createdAt: Date;
}