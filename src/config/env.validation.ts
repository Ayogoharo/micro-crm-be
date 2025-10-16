import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
  validateSync,
} from 'class-validator';

/**
 * Supported runtime environments.
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment variables schema with validation rules.
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  FRONTEND_HOST: string = 'localhost';

  @IsNumber()
  @Min(0)
  @Max(65535)
  FRONTEND_PORT: number = 3000;

  @IsString()
  DATABASE_HOST: string = 'localhost';

  @IsNumber()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_USER: string = 'postgres';

  @IsString()
  DATABASE_PASSWORD: string = 'postgres';

  @IsString()
  DATABASE_NAME: string = 'micro_crm';

  @IsString()
  JWT_SECRET: string = '';

  @IsString()
  JWT_EXPIRES_IN: string = '15m';
}

/**
 * Validates environment variables against the schema.
 * @throws {Error} If validation fails.
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
