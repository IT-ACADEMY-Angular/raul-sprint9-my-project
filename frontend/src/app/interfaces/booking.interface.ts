import { Company } from "./company.interface";

export interface Booking {
  id: number;
  bookingDate: Date;
  selectedWorker: string;
  selectedTask: string;
  selectedSchedule: string;
  selectedHour: string;
  duration: number;
  company: Company;
  user?: { id: number; name: string; phone?: string };
}