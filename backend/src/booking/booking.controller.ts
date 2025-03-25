import { Controller, Post, Body, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get('all')
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get(':id')
  async getBooking(@Param('id') id: number) {
    return this.bookingService.getBooking(id);
  }

  @Get('user/:userId')
  async getBookingsByUser(@Param('userId') userId: number) {
    return this.bookingService.getBookingsByUser(userId);
  }

  @Get('appointments/:companyId')
  async getAppointments(@Param('companyId') companyId: number, @Query('date') date: string) {
    const appointmentDate = new Date(date);
    return this.bookingService.getAppointmentsByDate(companyId, appointmentDate);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: number) {
    return this.bookingService.deleteBooking(id);
  }

  @Put(':id')
  async updateBooking(@Param('id') id: number, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.updateBooking(id, updateBookingDto);
  }
}
