import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from 'src/clients/dto/create-client.dto';

/**
 * Data transfer object for updating an existing client. All fields are optional.
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
