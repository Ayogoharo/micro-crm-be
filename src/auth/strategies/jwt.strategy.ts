import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { User } from 'src/users/entities/user.entity';

/**
 * Passport strategy for JWT authentication that validates tokens and loads user data.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /**
   * Validates JWT payload and loads the corresponding user from database.
   *
   * @param {JwtPayload} payload - The decoded JWT payload containing user ID
   *
   * @returns {Promise<User>} A promise that resolves with the user entity
   *
   * @throws {UnauthorizedException} If user is not found in database
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
