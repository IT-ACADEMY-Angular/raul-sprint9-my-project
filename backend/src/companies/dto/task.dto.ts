import { Expose } from 'class-transformer';

export class TaskDto {
  @Expose()
  name: string;

  @Expose()
  duration: number;
}