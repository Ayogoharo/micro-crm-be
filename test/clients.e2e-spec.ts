import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  registerUser,
  getAuthHeaders,
  createClient,
  generateTestClient,
  TestUser,
  TestClient,
} from './test-utils';

/**
 * Paginated response interface
 */
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  message: string | string[];
  statusCode: number;
  error?: string;
}

describe('Clients CRUD (e2e)', () => {
  let app: INestApplication;
  let user1: TestUser;
  let user2: TestUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create two test users for multi-user isolation tests
    user1 = await registerUser(app);
    user2 = await registerUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clients', () => {
    /**
     * Test Case: Create client with all fields - Success
     * Name: create_client_all_fields_success
     * Description: Creating client with name, email, phone, and notes should return created client with ID
     */
    it('should create client with all fields successfully', async () => {
      const clientData = generateTestClient({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        notes: 'VIP client',
      });

      const response = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set(getAuthHeaders(user1.token!))
        .send(clientData)
        .expect(201);

      const body = response.body as TestClient;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', clientData.name);
      expect(response.body).toHaveProperty('email', clientData.email);
      expect(response.body).toHaveProperty('phone', clientData.phone);
      expect(response.body).toHaveProperty('notes', clientData.notes);
      expect(body).toHaveProperty('userId', user1.id);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    /**
     * Test Case: Create client with only required field - Success
     * Name: create_client_minimal_success
     * Description: Creating client with only name (required field) should succeed
     */
    it('should create client with only name (required field)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set(getAuthHeaders(user1.token!))
        .send({
          name: 'Minimal Client',
        })
        .expect(201);

      const body = response.body as TestClient;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Minimal Client');
      expect(body.email).toBeNull();
      expect(body.phone).toBeNull();
      expect(body.notes).toBeNull();
    });

    /**
     * Test Case: Create client without auth token - Fail
     * Name: create_client_no_auth_fail
     * Description: Attempting to create client without JWT token should return 401 Unauthorized
     */
    it('should fail to create client without auth token (401 Unauthorized)', async () => {
      const clientData = generateTestClient();

      await request(app.getHttpServer() as Server)
        .post('/clients')
        .send(clientData)
        .expect(401);
    });

    /**
     * Test Case: Create client with invalid email - Fail
     * Name: create_client_invalid_email_fail
     * Description: Creating client with malformed email should return 400 Bad Request
     */
    it('should fail to create client with invalid email format (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set(getAuthHeaders(user1.token!))
        .send({
          name: 'Test Client',
          email: 'not-a-valid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Create client without name - Fail
     * Name: create_client_no_name_fail
     * Description: Creating client without required name field should return 400 Bad Request
     */
    it('should fail to create client without name (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set(getAuthHeaders(user1.token!))
        .send({
          email: 'test@example.com',
          phone: '+1234567890',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Create client with empty name - Fail
     * Name: create_client_empty_name_fail
     * Description: Creating client with empty string name should return 400 Bad Request
     */
    it('should fail to create client with empty name (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/clients')
        .set(getAuthHeaders(user1.token!))
        .send({
          name: '',
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('GET /clients', () => {
    /**
     * Test Case: Get all clients for authenticated user - Success
     * Name: get_clients_success
     * Description: Fetching clients list should return only clients belonging to authenticated user
     */
    it('should get all clients for authenticated user', async () => {
      // Create clients for user1
      await createClient(app, user1.token!, { name: 'User1 Client 1' });
      await createClient(app, user1.token!, { name: 'User1 Client 2' });

      // Create client for user2
      await createClient(app, user2.token!, { name: 'User2 Client' });

      const response = await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(user1.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(body.data)).toBe(true);

      // Verify only user1's clients are returned
      const user1ClientNames = body.data.map((client) => client.name);
      expect(user1ClientNames).toContain('User1 Client 1');
      expect(user1ClientNames).toContain('User1 Client 2');
      expect(user1ClientNames).not.toContain('User2 Client');
    });

    /**
     * Test Case: Get clients without auth - Fail
     * Name: get_clients_no_auth_fail
     * Description: Fetching clients without JWT token should return 401 Unauthorized
     */
    it('should fail to get clients without auth token (401 Unauthorized)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients')
        .expect(401);
    });

    /**
     * Test Case: Get empty clients list - Success
     * Name: get_clients_empty_success
     * Description: New user with no clients should receive empty array
     */
    it('should return empty array for user with no clients', async () => {
      const newUser = await registerUser(app);

      const response = await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(newUser.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data).toEqual([]);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /clients/:id', () => {
    /**
     * Test Case: Get specific client by ID - Success
     * Name: get_client_by_id_success
     * Description: Fetching existing client by ID should return full client details
     */
    it('should get specific client by ID', async () => {
      const client = await createClient(app, user1.token!, {
        name: 'Specific Client',
      });

      const response = await request(app.getHttpServer() as Server)
        .get(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(200);

      expect(response.body).toHaveProperty('id', client.id);
      expect(response.body).toHaveProperty('name', 'Specific Client');
      expect(response.body).toHaveProperty('userId', user1.id);
    });

    /**
     * Test Case: Get client of another user - Fail
     * Name: get_other_user_client_fail
     * Description: Attempting to fetch another user's client should return 404 Not Found
     */
    it('should fail to get client belonging to another user (404 Not Found)', async () => {
      const user2Client = await createClient(app, user2.token!, {
        name: 'User2 Private Client',
      });

      const response = await request(app.getHttpServer() as Server)
        .get(`/clients/${user2Client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);

      const body = response.body as ErrorResponse;

      expect(response.body).toHaveProperty('message');
      expect(body.message).toContain('not found');
    });

    /**
     * Test Case: Get non-existent client - Fail
     * Name: get_nonexistent_client_fail
     * Description: Fetching client with non-existent UUID should return 404 Not Found
     */
    it('should fail to get non-existent client (404 Not Found)', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer() as Server)
        .get(`/clients/${fakeUuid}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Get client with invalid UUID - Fail
     * Name: get_client_invalid_uuid_fail
     * Description: Fetching client with malformed UUID should return 400 Bad Request
     */
    it('should fail to get client with invalid UUID format (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients/invalid-uuid-format')
        .set(getAuthHeaders(user1.token!))
        .expect(400);
    });

    /**
     * Test Case: Get client without auth - Fail
     * Name: get_client_no_auth_fail
     * Description: Fetching client without JWT token should return 401 Unauthorized
     */
    it('should fail to get client without auth token (401 Unauthorized)', async () => {
      const client = await createClient(app, user1.token!);

      await request(app.getHttpServer() as Server)
        .get(`/clients/${client.id}`)
        .expect(401);
    });
  });

  describe('PATCH /clients/:id', () => {
    /**
     * Test Case: Update client - Success
     * Name: update_client_success
     * Description: Updating client fields should return updated client with new values
     */
    it('should update client successfully', async () => {
      const client = await createClient(app, user1.token!, {
        name: 'Original Name',
        email: 'original@example.com',
      });

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+9876543210',
        notes: 'Updated notes',
      };

      const response = await request(app.getHttpServer() as Server)
        .patch(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .send(updateData)
        .expect(200);

      const body = response.body as TestClient;

      expect(body).toHaveProperty('id', client.id);
      expect(body).toHaveProperty('name', updateData.name);
      expect(body).toHaveProperty('email', updateData.email);
      expect(body).toHaveProperty('phone', updateData.phone);
      expect(body).toHaveProperty('notes', updateData.notes);
    });

    /**
     * Test Case: Partial update client - Success
     * Name: update_client_partial_success
     * Description: Updating only some fields should change those fields and keep others unchanged
     */
    it('should partially update client (only specified fields)', async () => {
      const client = await createClient(app, user1.token!, {
        name: 'Original Name',
        email: 'original@example.com',
        phone: '+1111111111',
      });

      const response = await request(app.getHttpServer() as Server)
        .patch(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .send({
          name: 'New Name Only',
        })
        .expect(200);

      const body = response.body as TestClient;

      expect(body.name).toBe('New Name Only');
      expect(body.email).toBe(client.email);
      expect(body.phone).toBe(client.phone);
    });

    /**
     * Test Case: Update client of another user - Fail
     * Name: update_other_user_client_fail
     * Description: Attempting to update another user's client should return 404 Not Found
     */
    it('should fail to update client belonging to another user (404 Not Found)', async () => {
      const user2Client = await createClient(app, user2.token!, {
        name: 'User2 Client',
      });

      const response = await request(app.getHttpServer() as Server)
        .patch(`/clients/${user2Client.id}`)
        .set(getAuthHeaders(user1.token!))
        .send({
          name: 'Hacked Name',
        })
        .expect(404);

      const body = response.body as ErrorResponse;
      expect(body).toHaveProperty('message');
      expect(body.message).toContain('not found');
    });

    /**
     * Test Case: Update with invalid email - Fail
     * Name: update_client_invalid_email_fail
     * Description: Updating client with malformed email should return 400 Bad Request
     */
    it('should fail to update client with invalid email (400 Bad Request)', async () => {
      const client = await createClient(app, user1.token!);

      await request(app.getHttpServer() as Server)
        .patch(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .send({
          email: 'invalid-email-format',
        })
        .expect(400);
    });

    /**
     * Test Case: Update non-existent client - Fail
     * Name: update_nonexistent_client_fail
     * Description: Updating client with non-existent UUID should return 404 Not Found
     */
    it('should fail to update non-existent client (404 Not Found)', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer() as Server)
        .patch(`/clients/${fakeUuid}`)
        .set(getAuthHeaders(user1.token!))
        .send({
          name: 'New Name',
        })
        .expect(404);
    });

    /**
     * Test Case: Update client without auth - Fail
     * Name: update_client_no_auth_fail
     * Description: Updating client without JWT token should return 401 Unauthorized
     */
    it('should fail to update client without auth token (401 Unauthorized)', async () => {
      const client = await createClient(app, user1.token!);

      await request(app.getHttpServer() as Server)
        .patch(`/clients/${client.id}`)
        .send({
          name: 'New Name',
        })
        .expect(401);
    });
  });

  describe('DELETE /clients/:id', () => {
    /**
     * Test Case: Delete client - Success
     * Name: delete_client_success
     * Description: Deleting existing client should return 204 No Content and remove client
     */
    it('should delete client successfully', async () => {
      const client = await createClient(app, user1.token!, {
        name: 'Client To Delete',
      });

      await request(app.getHttpServer() as Server)
        .delete(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(204);

      // Verify client no longer exists
      await request(app.getHttpServer() as Server)
        .get(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);
    });

    /**
     * Test Case: Delete client of another user - Fail
     * Name: delete_other_user_client_fail
     * Description: Attempting to delete another user's client should return 404 Not Found
     */
    it('should fail to delete client belonging to another user (404 Not Found)', async () => {
      const user2Client = await createClient(app, user2.token!, {
        name: 'User2 Protected Client',
      });

      const response = await request(app.getHttpServer() as Server)
        .delete(`/clients/${user2Client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);

      expect(response.body).toHaveProperty('message');

      // Verify user2 can still access their client
      await request(app.getHttpServer() as Server)
        .get(`/clients/${user2Client.id}`)
        .set(getAuthHeaders(user2.token!))
        .expect(200);
    });

    /**
     * Test Case: Delete non-existent client - Fail
     * Name: delete_nonexistent_client_fail
     * Description: Deleting client with non-existent UUID should return 404 Not Found
     */
    it('should fail to delete non-existent client (404 Not Found)', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer() as Server)
        .delete(`/clients/${fakeUuid}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);
    });

    /**
     * Test Case: Delete client without auth - Fail
     * Name: delete_client_no_auth_fail
     * Description: Deleting client without JWT token should return 401 Unauthorized
     */
    it('should fail to delete client without auth token (401 Unauthorized)', async () => {
      const client = await createClient(app, user1.token!);

      await request(app.getHttpServer() as Server)
        .delete(`/clients/${client.id}`)
        .expect(401);
    });

    /**
     * Test Case: Delete already deleted client - Fail
     * Name: delete_twice_fail
     * Description: Attempting to delete same client twice should fail on second attempt
     */
    it('should fail to delete already deleted client (404 Not Found)', async () => {
      const client = await createClient(app, user1.token!);

      // First deletion succeeds
      await request(app.getHttpServer() as Server)
        .delete(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(204);

      // Second deletion fails
      await request(app.getHttpServer() as Server)
        .delete(`/clients/${client.id}`)
        .set(getAuthHeaders(user1.token!))
        .expect(404);
    });
  });
});
