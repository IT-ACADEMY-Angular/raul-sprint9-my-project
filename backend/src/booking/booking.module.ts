import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Company } from 'src/companies/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Company]),
  ],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule { }
