import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

/**
 * Custom parameter decorator that extracts the authenticated user from the request.
 *
 * @param property - Optional specific property to extract ('id' or 'email')
 * @returns The user object, or user ID/email as string, or dates
 *
 * @example
 * // Get full user object
 * async getProfile(@CurrentUser() user: User) {}
 *
 * // Get only user ID
 * async getClients(@CurrentUser('id') userId: string) {}
 */
export const CurrentUser = createParamDecorator(
  (
    property: 'id' | 'email' | 'createdAt' | 'updatedAt' | undefined,
    ctx: ExecutionContext,
  ): User | string | Date => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (!property) {
      return user;
    }

    return user[property];
  },
);
