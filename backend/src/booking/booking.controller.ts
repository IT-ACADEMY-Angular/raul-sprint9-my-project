import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get(':id')
  async getBooking(@Param('id') id: number) {
    return this.bookingService.getBooking(id);
  }

  @Get('user/:userId')
  async getBookingsByUser(@Param('userId') userId: number) {
    return this.bookingService.getBookingsByUser(userId);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: number) {
    return this.bookingService.deleteBooking(id);
  }
}
