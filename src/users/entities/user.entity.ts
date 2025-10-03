import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthProvider } from '../enums/auth-provider.enum';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import type { Client } from '../../clients/entities/client.entity';

/**
 * User entity representing registered users in the system.
 */
@Entity('users')
export class User {
  /**
   * Unique user identifier (UUID v4).
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User's email address (unique constraint).
   */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  /**
   * Hashed password for local authentication (null for OAuth users).
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash!: string | null;

  /**
   * Authentication provider used for user registration.
   */
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider!: AuthProvider;

  /**
   * User's subscription plan (FREE or PRO).
   */
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan!: SubscriptionPlan;

  /**
   * Collection of clients managed by this user.
   */
  @OneToMany('Client', 'user')
  clients!: Client[];

  /**
   * Timestamp when the user was created.
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Timestamp when the user was last updated.
   */
  @UpdateDateColumn()
  updatedAt!: Date;
}
