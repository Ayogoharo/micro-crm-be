import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for user registration.
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123',
    minLength: 8,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
