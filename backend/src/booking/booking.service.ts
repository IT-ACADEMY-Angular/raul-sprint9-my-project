import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Company } from '../companies/company.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { companyId, userId, bookingDate, selectedWorker, selectedTask, selectedSchedule, selectedHour } = createBookingDto;

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: { id: userId } as any,
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

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async deleteBooking(id: number): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Reserva no encontrada');
    }
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
    });
  }

  async updateBooking(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }
    booking.bookingDate = updateBookingDto.bookingDate;
    booking.selectedHour = updateBookingDto.selectedHour;
    return this.bookingRepository.save(booking);
  }
}