export interface WorkerSchedule {
  workingDays: string[];
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkerData {
  name: string;
  tasks?: { name: string; duration: number }[];
  photoUrl?: string;
  workingDays?: string[];
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
}