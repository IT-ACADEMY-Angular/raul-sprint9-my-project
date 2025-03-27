import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, Like } from 'typeorm';
import { Company } from './company.entity';
import { Worker } from './worker.entity';

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
          workingDays: worker.schedule ? worker.schedule.workingDays : [],
          startTime: worker.schedule ? worker.schedule.startTime : '',
          endTime: worker.schedule ? worker.schedule.endTime : '',
          breakStart: worker.schedule ? worker.schedule.breakStart : '',
          breakEnd: worker.schedule ? worker.schedule.breakEnd : '',
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
    const company = await this.companyRepository.findOne({ where: { id } });
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

  async searchCompanies(query: string): Promise<Company[]> {
    if (!query) return [];
    return this.companyRepository.find({
      where: { name: Like(`%${query}%`) },
    });
  }

  async getCompanyByUserId(userId: number): Promise<Company | null> {
    try {
      const options: FindOneOptions<Company> = {
        where: { owner: { id: userId } },
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
    // Obtiene todas las empresas
    return await this.companyRepository.find();
  }
}
