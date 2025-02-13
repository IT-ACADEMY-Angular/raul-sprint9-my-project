import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Worker } from './worker.entity';
import { Task } from './task.entity';
import { CompaniesService } from '../companies/companies.service';
import { CompaniesController } from '../companies/companies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Worker, Task])],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule { }
