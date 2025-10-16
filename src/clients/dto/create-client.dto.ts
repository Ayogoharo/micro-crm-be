import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for creating a new client.
 */
export class CreateClientDto {
  @ApiProperty({
    description: 'Client full name',
    example: 'John Doe',
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'john@example.com',
    required: false,
    type: String,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+1234567890',
    required: false,
    maxLength: 20,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Additional notes about the client',
    example: 'VIP client, prefers morning appointments',
    required: false,
    maxLength: 1000,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
