// src/pos-sessions/pos-session.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Shop } from '../../shops/entities';

@Entity('pos_sessions')
export class PosSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sessionCode: string;   // e.g. "A9X3K2" shown as QR

  @Column()
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ nullable: true })
  laptopSocketId: string | null;

  @Column({ nullable: true })
  lastScannedProductId: number | null;

  @Column({ default: 'active' })
  status: 'active' | 'expired';

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}