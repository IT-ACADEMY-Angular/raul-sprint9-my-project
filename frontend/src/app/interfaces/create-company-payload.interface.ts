export interface CreateCompanyPayload {
  ownerId: number;
  name: string;
  photoUrl?: string;
  workerData?: { name: string; tasks?: { name: string; duration: number }[] }[];
  workingDays: string[];
  startTime: string;
  endTime: string;
  appointmentInterval: number;
  breakStart?: string;
  breakEnd?: string;
}