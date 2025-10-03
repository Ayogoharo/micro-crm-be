import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard for protecting routes that require authentication.
 *
 * @throws {UnauthorizedException} If JWT token is missing or invalid
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
