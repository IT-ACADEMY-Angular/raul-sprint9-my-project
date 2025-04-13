import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, Like } from 'typeorm';
import { Company } from './company.entity';
import { Worker } from './worker.entity';
import { Task } from './task.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) { }

  async createCompany(
    ownerId: number,
    name: string,
    photoUrl: string,
    workerData: any[],
    appointmentInterval: number,
  ): Promise<Company> {
    const company = this.companyRepository.create({
      name,
      photoUrl,
      appointmentInterval,
    });
    company.owner = { id: ownerId } as any;
    if (workerData && workerData.length > 0) {
      company.workers = workerData.map(worker => {
        const newWorker = this.workerRepository.create({
          name: worker.name,
          workingDays: worker.schedule ? worker.schedule.workingDays : (worker.workingDays || []),
          startTime: worker.schedule ? worker.schedule.startTime : (worker.startTime || ''),
          endTime: worker.schedule ? worker.schedule.endTime : (worker.endTime || ''),
          breakStart: worker.schedule ? worker.schedule.breakStart : (worker.breakStart || ''),
          breakEnd: worker.schedule ? worker.schedule.breakEnd : (worker.breakEnd || ''),
        });
        if (worker.tasks && worker.tasks.length > 0) {
          newWorker.tasks = worker.tasks.map(task => ({ name: task.name, duration: task.duration }));
        }
        return newWorker;
      });
    }
    return this.companyRepository.save(company);
  }

  async findCompanyById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['workers', 'workers.tasks']
    });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return company;
  }

  async updateCompanyPhoto(id: number, photoUrl: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }
    company.photoUrl = photoUrl;
    return this.companyRepository.save(company);
  }

  async updateCompany(id: number, payload: any): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['workers', 'workers.tasks']
    });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    company.name = payload.name;
    company.photoUrl = payload.photoUrl;
    company.appointmentInterval = payload.appointmentInterval;

    let updatedWorkers: Worker[] = [];

    for (const workerData of payload.workerData || []) {
      if (workerData.id) {
        const existingWorker = company.workers.find(w => w.id === workerData.id);
        if (existingWorker) {
          existingWorker.name = workerData.name;
          existingWorker.workingDays = workerData.schedule
            ? workerData.schedule.workingDays
            : (workerData.workingDays || []);
          existingWorker.startTime = workerData.schedule
            ? workerData.schedule.startTime
            : (workerData.startTime || '');
          existingWorker.endTime = workerData.schedule
            ? workerData.schedule.endTime
            : (workerData.endTime || '');
          existingWorker.breakStart = workerData.schedule
            ? workerData.schedule.breakStart
            : (workerData.breakStart || '');
          existingWorker.breakEnd = workerData.schedule
            ? workerData.schedule.breakEnd
            : (workerData.breakEnd || '');

          const currentTasksJson = JSON.stringify(existingWorker.tasks || []);
          const newTasksJson = JSON.stringify(workerData.tasks || []);

          if (currentTasksJson !== newTasksJson) {
            await this.workerRepository.manager.delete(Task, { worker: existingWorker });

            if (workerData.tasks && workerData.tasks.length > 0) {
              existingWorker.tasks = workerData.tasks.map(task => ({
                name: task.name,
                duration: task.duration
              }));
            } else {
              existingWorker.tasks = [];
            }
          }

          updatedWorkers.push(existingWorker);
        }
      } else {
        const newWorker = this.workerRepository.create({
          name: workerData.name,
          workingDays: workerData.schedule
            ? workerData.schedule.workingDays
            : (workerData.workingDays || []),
          startTime: workerData.schedule
            ? workerData.schedule.startTime
            : (workerData.startTime || ''),
          endTime: workerData.schedule
            ? workerData.schedule.endTime
            : (workerData.endTime || ''),
          breakStart: workerData.schedule
            ? workerData.schedule.breakStart
            : (workerData.breakStart || ''),
          breakEnd: workerData.schedule
            ? workerData.schedule.breakEnd
            : (workerData.breakEnd || ''),
          tasks: workerData.tasks && workerData.tasks.length > 0
            ? workerData.tasks.map(task => ({ name: task.name, duration: task.duration }))
            : []
        });
        newWorker.company = company;
        updatedWorkers.push(newWorker);
      }
    }

    const payloadWorkerIds = updatedWorkers
      .filter(w => w.id)
      .map(w => w.id);
    const workersToRemove = company.workers.filter(
      w => !payloadWorkerIds.includes(w.id)
    );
    if (workersToRemove.length > 0) {
      await this.workerRepository.remove(workersToRemove);
    }

    company.workers = updatedWorkers;
    return await this.companyRepository.save(company);
  }

  async searchCompanies(query: string): Promise<Company[]> {
    if (!query) return [];
    return this.companyRepository.find({
      where: { name: Like(`%${query}%`) },
      relations: ['workers', 'workers.tasks']
    });
  }

  async getCompanyByUserId(userId: number): Promise<Company | null> {
    try {
      const options: FindOneOptions<Company> = {
        where: { owner: { id: userId } },
        relations: ['workers', 'workers.tasks']
      };
      const company = await this.companyRepository.findOne(options);
      return company || null;
    } catch (error) {
      console.error('Error en getCompanyByUserId:', error);
      throw error;
    }
  }

  async deleteCompanyByOwnerId(ownerId: number): Promise<boolean> {
    const company = await this.companyRepository.findOne({
      where: { owner: { id: ownerId } },
    });
    if (!company) {
      return false;
    }
    await this.companyRepository.remove(company);
    return true;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await this.companyRepository.find({ relations: ['workers', 'workers.tasks'] });
  }
}
