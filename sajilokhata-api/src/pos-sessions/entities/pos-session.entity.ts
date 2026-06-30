import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from '../../shops/entities';

@Entity('pos_sessions')
export class PosSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sessionCode: string;

  @Column()
  shopId: number;

  @ManyToOne(() => Shop, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

 @Column({
  type: 'varchar',
  nullable: true,
})
laptopSocketId: string | null;

  @CreateDateColumn()
  createdAt: Date;

}