import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities';

export type PlanType = 'trial' | 'basic' | 'pro';
export type ShopStatus = 'trial' | 'active' | 'expired';

@Entity('shops')
export class Shop {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @OneToOne(() => User, (user) => user.shop)
    owner: User;

    @Column({ type: 'varchar', default: 'trial' })
    plan: PlanType;

    @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
    trialEndsAt: Date;

    @Column({ name: 'subscription_end', type: 'timestamp', nullable: true })
    subscriptionEnd: Date;

    @Column({ type: 'varchar', default: 'trial' })
    status: ShopStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}