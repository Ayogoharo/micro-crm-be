import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthProvider } from 'src/users/enums/auth-provider.enum';

/**
 * Service for managing user entities and database operations.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Finds a user entity by email address.
   *
   * @param {string} email - The email of the user to find
   *
   * @returns {Promise<User | null>} A promise that resolves with the user entity if found, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Finds a user entity by ID.
   *
   * @param {string} id - The UUID of the user to find
   *
   * @returns {Promise<User | null>} A promise that resolves with the user entity if found, or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Creates a new user.
   *
   * @param {string} email - The email of the user
   * @param {string | null} passwordHash - The hashed password, or null for OAuth users
   * @param {AuthProvider} provider - The authentication provider (default: LOCAL)
   *
   * @returns {Promise<User>} A promise that resolves with the created user entity
   */
  async create(
    email: string,
    passwordHash: string | null,
    provider: AuthProvider = AuthProvider.LOCAL,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      passwordHash,
      provider,
    });
    return this.usersRepository.save(user);
  }
}
