import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { Worker } from './worker.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @ManyToOne(() => User, user => user.companies, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Worker, worker => worker.company, { cascade: true, eager: true })
  workers: Worker[];

  @Column('simple-array', { nullable: true })
  workingDays: string[];

  @Column({ nullable: true })
  startTime?: string;

  @Column({ nullable: true })
  endTime?: string;

  @Column({ nullable: true, type: 'int' })
  appointmentInterval?: number;

  @Column({ nullable: true })
  breakStart?: string;

  @Column({ nullable: true })
  breakEnd?: string;
}
