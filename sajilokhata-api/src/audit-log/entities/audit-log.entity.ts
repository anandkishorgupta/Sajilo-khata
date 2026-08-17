import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from '../../shops/entities';
import { User } from '../../users/entities';

@Entity('audit_logs')
@Index(['shopId', 'createdAt'])
@Index(['shopId', 'entityType'])
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column({ name: 'shop_id' })
    shopId: number;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number | null;

    @Column({ name: 'user_name', type: 'varchar', nullable: true })
    userName: string | null;

    @Column({ name: 'user_role', type: 'varchar', nullable: true })
    userRole: string | null;

    @Column({ type: 'varchar' })
    action: string;

    @Column({ name: 'entity_type', type: 'varchar' })
    entityType: string;

    @Column({ name: 'entity_id', type: 'int', nullable: true })
    entityId: number | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'old_values', type: 'jsonb', nullable: true })
    oldValues: Record<string, any> | null;

    @Column({ name: 'new_values', type: 'jsonb', nullable: true })
    newValues: Record<string, any> | null;

    @Column({ name: 'ip_address', type: 'varchar', nullable: true })
    ipAddress: string | null;

    @Column({ name: 'user_agent', type: 'varchar', nullable: true })
    userAgent: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
