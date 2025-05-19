import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique
} from 'typeorm';
import { User } from './User';

@Entity('uploads')
@Unique(['filename', 'user'])
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  filename: string;

  @CreateDateColumn({ type: 'timestamp' })
  uploaded_at: Date;

  @Column({ nullable: true })
  total_records: number;

  @Column({ nullable: true })
  valid_records: number;

  @Column({ nullable: true })
  invalid_records: number;
}
