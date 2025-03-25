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
    const { companyId, userId, bookingDate, selectedWorker, selectedTask, selectedSchedule, selectedHour, duration } = createBookingDto;

    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const newBookingStart = new Date(bookingDate);
    const [startHour, startMinute] = selectedHour.split(':').map(Number);
    newBookingStart.setHours(startHour, startMinute, 0, 0);
    const newBookingEnd = new Date(newBookingStart.getTime() + duration * 60000);

    const startOfDay = new Date(newBookingStart);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newBookingStart);
    endOfDay.setHours(23, 59, 59, 999);

    const userBookings = await this.bookingRepository.createQueryBuilder("booking")
      .where("booking.userId = :userId", { userId })
      .andWhere("booking.bookingDate BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
      .getMany();

    for (const b of userBookings) {
      const existingStart = new Date(b.bookingDate);
      const [bHour, bMinute] = b.selectedHour.split(':').map(Number);
      existingStart.setHours(bHour, bMinute, 0, 0);
      const existingEnd = new Date(existingStart.getTime() + b.duration * 60000);
      if (newBookingStart < existingEnd && newBookingEnd > existingStart) {
        throw new Error("Ya tienes una reserva que se solapa en ese horario.");
      }
    }

    const booking = this.bookingRepository.create({
      bookingDate,
      selectedWorker,
      selectedTask,
      selectedSchedule,
      selectedHour,
      duration,
      company,
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

  async getAppointmentsByDate(companyId: number, date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.bookingRepository.createQueryBuilder("booking")
      .leftJoin("booking.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("booking.bookingDate BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
      .getMany();
  }
}