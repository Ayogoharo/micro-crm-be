import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

/**
 * Client entity representing a customer of the service business.
 */
@Entity('clients')
export class Client {
  /** Unique identifier */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Client full name */
  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  /** Client email address */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email!: string | null;

  /** Client phone number */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone!: string | null;

  /** Additional notes about the client */
  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;

  /** Owner of this client record */
  @ManyToOne(() => User, (user) => user.clients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /** Foreign key to user */
  @Column({
    type: 'uuid',
  })
  userId!: string;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt!: Date;

  /** Last update timestamp */
  @UpdateDateColumn()
  updatedAt!: Date;
}
