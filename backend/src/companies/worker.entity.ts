import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Task } from '../companies/task.entity';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column('simple-array', { nullable: true })
  workingDays?: string[];

  @Column({ nullable: true })
  startTime?: string;

  @Column({ nullable: true })
  endTime?: string;

  @Column({ nullable: true })
  breakStart?: string;

  @Column({ nullable: true })
  breakEnd?: string;

  @ManyToOne(() => Company, company => company.workers, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => Task, task => task.worker, { cascade: true, eager: true })
  tasks: Task[];
}
