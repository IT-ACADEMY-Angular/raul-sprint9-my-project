import { WorkerData } from "../models/worker.model";

export interface Company {
  id: number;
  name: string;
  photoUrl?: string;
  workers?: WorkerData[];
}