import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';

/**
 * Auth response interface
 */
interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Paginated response interface
 */
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Test user interface
 */
export interface TestUser {
  email: string;
  password: string;
  token?: string;
  id?: string;
}

/**
 * Test client interface
 */
export interface TestClient {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * Generate unique email for testing
 * Uses timestamp and random number to ensure uniqueness across test runs
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-user-${timestamp}-${random}@example.com`;
}

/**
 * Generate test user data
 */
export function generateTestUser(customData?: Partial<TestUser>): TestUser {
  return {
    email: customData?.email || generateUniqueEmail(),
    password: customData?.password || 'Test123!@#',
    ...customData,
  };
}

/**
 * Generate test client data
 */
export function generateTestClient(
  customData?: Partial<TestClient>,
): TestClient {
  const timestamp = Date.now();
  return {
    name: customData?.name || `Test Client ${timestamp}`,
    email: customData?.email || `client-${timestamp}@example.com`,
    phone: customData?.phone || '+1234567890',
    notes: customData?.notes || 'Test notes',
    ...customData,
  };
}

/**
 * Register a new user via API
 * Returns the created user data
 */
export async function registerUser(
  app: INestApplication,
  userData?: Partial<TestUser>,
): Promise<TestUser> {
  const user = generateTestUser(userData);

  const response = await request(app.getHttpServer() as Server)
    .post('/auth/register')
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(201);

  const body = response.body as AuthResponse;

  return {
    ...user,
    token: body.access_token,
    id: body.user.id,
  };
}

/**
 * Login user and get JWT token
 * Returns user with token
 */
export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const response = await request(app.getHttpServer() as Server)
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  const body = response.body as AuthResponse;

  return {
    token: body.access_token,
    userId: body.user.id,
  };
}

/**
 * Register and login user (convenience method)
 * Returns user with token
 */
export async function createAuthenticatedUser(
  app: INestApplication,
  userData?: Partial<TestUser>,
): Promise<TestUser> {
  return await registerUser(app, userData);
}

/**
 * Get authorization headers with Bearer token
 */
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create a client via API with authentication
 * Returns the created client
 */
export async function createClient(
  app: INestApplication,
  token: string,
  clientData?: Partial<TestClient>,
): Promise<TestClient> {
  const client = generateTestClient(clientData);

  const response = await request(app.getHttpServer() as Server)
    .post('/clients')
    .set(getAuthHeaders(token))
    .send(client)
    .expect(201);

  return response.body as TestClient;
}

/**
 * Create multiple clients via API
 * Returns array of created clients
 */
export async function createMultipleClients(
  app: INestApplication,
  token: string,
  count: number,
  customData?: Partial<TestClient>,
): Promise<TestClient[]> {
  const clients: TestClient[] = [];

  for (let i = 0; i < count; i++) {
    const client = await createClient(app, token, {
      name: `Test Client ${i + 1}`,
      ...customData,
    });
    clients.push(client);
  }

  return clients;
}

/**
 * Get all clients via API
 */
export async function getClients(
  app: INestApplication,
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  },
): Promise<PaginatedResponse<TestClient> | TestClient[]> {
  let url = '/clients';
  const queryParams: string[] = [];

  if (params?.page) queryParams.push(`page=${params.page}`);
  if (params?.limit) queryParams.push(`limit=${params.limit}`);
  if (params?.search) queryParams.push(`search=${params.search}`);

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await request(app.getHttpServer() as Server)
    .get(url)
    .set(getAuthHeaders(token))
    .expect(200);

  return response.body as PaginatedResponse<TestClient> | TestClient[];
}

/**
 * Get client by ID via API
 */
export async function getClientById(
  app: INestApplication,
  token: string,
  clientId: string,
): Promise<TestClient> {
  const response = await request(app.getHttpServer() as Server)
    .get(`/clients/${clientId}`)
    .set(getAuthHeaders(token))
    .expect(200);

  return response.body as TestClient;
}

/**
 * Update client via API
 */
export async function updateClient(
  app: INestApplication,
  token: string,
  clientId: string,
  updateData: Partial<TestClient>,
): Promise<TestClient> {
  const response = await request(app.getHttpServer() as Server)
    .patch(`/clients/${clientId}`)
    .set(getAuthHeaders(token))
    .send(updateData)
    .expect(200);

  return response.body as TestClient;
}

/**
 * Delete client via API
 */
export async function deleteClient(
  app: INestApplication,
  token: string,
  clientId: string,
): Promise<void> {
  await request(app.getHttpServer() as Server)
    .delete(`/clients/${clientId}`)
    .set(getAuthHeaders(token))
    .expect(204);
}
