import { Exclude, Expose, Type } from 'class-transformer';
import { TaskDto } from './task.dto';

export class WorkerDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  photoUrl?: string;

  @Expose()
  workingDays?: string[];

  @Expose()
  startTime?: string;

  @Expose()
  endTime?: string;

  @Expose()
  breakStart?: string;

  @Expose()
  breakEnd?: string;

  @Expose()
  @Type(() => TaskDto)
  tasks?: TaskDto[];

  @Exclude()
  company?: any;
}
