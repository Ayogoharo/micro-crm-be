import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { CreateClientDto, UpdateClientDto } from 'src/clients/dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    userId: string,
  ): Promise<Client> {
    const client = this.clientRepository.create({
      ...createClientDto,
      userId,
    });
    return this.clientRepository.save(client);
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Client> = { userId };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    userId: string,
  ): Promise<Client> {
    const client = await this.findOne(id, userId);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientRepository.remove(client);
  }
}
