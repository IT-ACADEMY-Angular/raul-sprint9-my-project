export class CreateBookingDto {
    bookingDate: Date;
    selectedWorker: string;
    selectedTask: string;
    selectedSchedule: string;
    selectedHour: string;
    userId: number;
    companyId: number;
    duration: number;
}