import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto, LoginDto } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { CurrentUser } from 'src/auth/decorators';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

/**
 * Controller for authentication endpoints including registration, login, and profile access.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account with email and password.
   *
   * @param {RegisterDto} registerDto - Registration data containing email and password
   *
   * @returns {Promise<object>} A promise that resolves with the created user data
   *
   * @throws {ConflictException} If email already exists in database
   * @throws {BadRequestException} If validation fails
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticates a user and returns a JWT access token.
   *
   * @param {LoginDto} loginDto - Login credentials containing email and password
   *
   * @returns {Promise<object>} A promise that resolves with access token and user data
   *
   * @throws {UnauthorizedException} If credentials are invalid
   * @throws {BadRequestException} If validation fails
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Retrieves the current authenticated user's profile information.
   *
   * @param {JwtPayload} user - The authenticated user extracted from JWT token
   *
   * @returns {object} An object containing the user's ID and email
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: JwtPayload) {
    return {
      userId: user.sub,
      email: user.email,
    };
  }
}
