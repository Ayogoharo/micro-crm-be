import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { CreateClientDto, UpdateClientDto } from 'src/clients/dto';

/**
 * Service for managing client records.
 */
@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Creates a new client for the specified user.
   */
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

  /**
   * Retrieves paginated list of clients for the specified user with optional search.
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
    // Ensure page and limit are positive numbers
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: FindOptionsWhere<Client> = { userId };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      skip,
      take: safeLimit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  /**
   * Finds a single client by ID for the specified user.
   * @throws {NotFoundException} If client not found or belongs to different user.
   */
  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  /**
   * Updates an existing client.
   * @throws {NotFoundException} If client not found or belongs to different user.
   */
  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    userId: string,
  ): Promise<Client> {
    const client = await this.findOne(id, userId);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  /**
   * Deletes a client.
   * @throws {NotFoundException} If client not found or belongs to different user.
   */
  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientRepository.remove(client);
  }
}
