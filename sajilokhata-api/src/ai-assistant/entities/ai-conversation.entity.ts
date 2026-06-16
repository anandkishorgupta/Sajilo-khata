import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Shop } from "../../shops/entities/shop.entity";
import { User } from "../../users/entities/user.entity";

@Entity("ai_conversations")
export class AiConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  title: string;

  @Column({ type: "jsonb", default: "[]" })
  messages: { role: string; content: string; chart?: any; pendingAction?: any; options?: string[] }[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
