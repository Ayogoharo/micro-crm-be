import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;

  @ManyToOne(() => User, (user) => user.clients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'uuid',
  })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
