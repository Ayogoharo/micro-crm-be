import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthProvider } from 'src/users/enums/auth-provider.enum';
import { SubscriptionPlan } from 'src/users/enums/subscription-plan.enum';
import type { Client } from 'src/clients/entities/client.entity';

/**
 * User entity representing a registered user of the CRM system.
 */
@Entity('users')
export class User {
  /** Unique identifier */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** User email address (unique) */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  /** Hashed password (null for OAuth users) */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash!: string | null;

  /** Authentication provider used for this account */
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider!: AuthProvider;

  /** Subscription plan level */
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan!: SubscriptionPlan;

  /** Clients owned by this user */
  @OneToMany('Client', 'user')
  clients!: Client[];

  /** Account creation timestamp */
  @CreateDateColumn()
  createdAt!: Date;

  /** Last update timestamp */
  @UpdateDateColumn()
  updatedAt!: Date;
}
