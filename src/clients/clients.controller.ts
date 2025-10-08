import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ClientsService } from 'src/clients/clients.service';
import { CreateClientDto, UpdateClientDto } from 'src/clients/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new client',
    description:
      'Creates a new client associated with the authenticated user. All fields except name are optional.',
  })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({
    status: 201,
    description: 'Client successfully created',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        notes: 'VIP client',
        userId: 'uuid',
        createdAt: '2025-10-06T10:12:25.524Z',
        updatedAt: '2025-10-06T10:12:25.524Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.create(createClientDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'List all clients',
    description:
      'Returns a paginated list of clients for the authenticated user. Supports search by name.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by client name (case-insensitive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            notes: 'VIP client',
            userId: 'uuid',
            createdAt: '2025-10-06T10:12:25.524Z',
            updatedAt: '2025-10-06T10:12:25.524Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(userId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single client',
    description:
      'Returns a single client by ID. Client must belong to authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Client UUID' })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        notes: 'VIP client',
        userId: 'uuid',
        createdAt: '2025-10-06T10:12:25.524Z',
        updatedAt: '2025-10-06T10:12:25.524Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.clientsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a client',
    description:
      'Updates an existing client. Supports partial updates. Client must belong to authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Client UUID' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        notes: 'Updated notes',
        userId: 'uuid',
        createdAt: '2025-10-06T10:12:25.524Z',
        updatedAt: '2025-10-06T10:13:40.641Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.update(id, updateClientDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a client',
    description:
      'Permanently deletes a client. Client must belong to authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Client UUID' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.clientsService.remove(id, userId);
  }
}
