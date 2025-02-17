export interface CreateBookingPayload {
  bookingDate: Date;
  selectedWorker: string;
  selectedTask: string;
  selectedSchedule: string;
  selectedHour: string;
  companyId: number;
  userId: number;
}