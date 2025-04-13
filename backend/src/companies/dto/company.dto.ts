import { Expose, Type } from 'class-transformer';
import { WorkerDto } from './worker.dto';

export class CompanyDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  photoUrl?: string;

  @Expose()
  appointmentInterval?: number;

  @Expose()
  @Type(() => WorkerDto)
  workers: WorkerDto[];
}
