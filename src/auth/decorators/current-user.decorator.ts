import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Custom parameter decorator that extracts the authenticated user from the request.
 *
 * @param data - Optional property name to extract from the user (e.g., 'id', 'email')
 * @returns The user object or a specific property if data is provided
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof User | undefined,
    ctx: ExecutionContext,
  ): User | string | Date => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (!data) {
      return user;
    }

    const value = user[data];

    // Return primitive types as-is, convert others to string
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    if (value instanceof Date) {
      return value;
    }

    // For any other type (like relations), return empty string
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return value !== null && value !== undefined ? String(value) : '';
  },
);
