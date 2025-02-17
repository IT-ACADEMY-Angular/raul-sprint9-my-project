import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    bookingDate: Date;

    @Column()
    selectedWorker: string;

    @Column()
    selectedTask: string;

    @Column()
    selectedSchedule: string;

    @Column()
    selectedHour: string;

    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'companyId' })
    company: Company;
}
