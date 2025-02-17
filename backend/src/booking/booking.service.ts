import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Company } from '../companies/company.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { companyId, bookingDate, selectedWorker, selectedTask, selectedSchedule, selectedHour } = createBookingDto;

    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const booking = this.bookingRepository.create({
      bookingDate,
      selectedWorker,
      selectedTask,
      selectedSchedule,
      selectedHour,
      company,
    });

    return this.bookingRepository.save(booking);
  }

  async getBooking(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return booking;
  }
}