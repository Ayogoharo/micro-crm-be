import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  generateTestUser,
  generateUniqueEmail,
  registerUser,
  loginUser,
  getAuthHeaders,
} from './test-utils';

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
 * Error response interface
 */
interface ErrorResponse {
  message: string | string[];
  statusCode: number;
  error?: string;
}

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    /**
     * Test Case: Register new user - Success
     * Name: register_success
     * Description: User registration with valid email and password should create account and return JWT token
     */
    it('should register new user successfully and return JWT token', async () => {
      const user = generateTestUser();

      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(201);

      const body = response.body as AuthResponse;

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email', user.email);
      expect(body.user).not.toHaveProperty('password');
      expect(typeof body.access_token).toBe('string');
      expect(body.access_token.length).toBeGreaterThan(0);
    });

    /**
     * Test Case: Register with existing email - Fail
     * Name: register_duplicate_email_fail
     * Description: Attempting to register with already used email should return 409 Conflict
     */
    it('should fail when registering with existing email (409 Conflict)', async () => {
      const user = await registerUser(app);

      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: user.email,
          password: 'AnotherPassword123!',
        })
        .expect(409);

      const body = response.body as ErrorResponse;

      expect(response.body).toHaveProperty('message');
      expect(body.message).toContain('already registered');
    });

    /**
     * Test Case: Register with invalid email format - Fail
     * Name: register_invalid_email_fail
     * Description: Registration with malformed email should return 400 Bad Request
     */
    it('should fail when registering with invalid email format (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: 'not-a-valid-email',
          password: 'ValidPassword123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Register with missing email - Fail
     * Name: register_missing_email_fail
     * Description: Registration without email field should return 400 Bad Request
     */
    it('should fail when registering without email (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          password: 'ValidPassword123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Register with weak password - Fail
     * Name: register_weak_password_fail
     * Description: Registration with password too short or weak should return 400 Bad Request
     */
    it('should fail when registering with weak password (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: generateUniqueEmail(),
          password: '123', // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    /**
     * Test Case: Register with missing password - Fail
     * Name: register_missing_password_fail
     * Description: Registration without password field should return 400 Bad Request
     */
    it('should fail when registering without password (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: generateUniqueEmail(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    /**
     * Test Case: Login with valid credentials - Success
     * Name: login_success
     * Description: Login with correct email and password should return JWT token
     */
    it('should login successfully with valid credentials and return JWT token', async () => {
      const user = await registerUser(app);

      const response = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const body = response.body as AuthResponse;

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id', user.id);
      expect(body.user).toHaveProperty('email', user.email);
      expect(body.user).not.toHaveProperty('password');
      expect(typeof body.access_token).toBe('string');
      expect(body.access_token.length).toBeGreaterThan(0);
    });

    /**
     * Test Case: Login with wrong password - Fail
     * Name: login_wrong_password_fail
     * Description: Login attempt with incorrect password should return 401 Unauthorized
     */
    it('should fail when logging in with wrong password (401 Unauthorized)', async () => {
      const user = await registerUser(app);

      const response = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      const body = response.body as ErrorResponse;

      expect(response.body).toHaveProperty('message');
      expect(body.message).toContain('Invalid');
    });

    /**
     * Test Case: Login with non-existent email - Fail
     * Name: login_nonexistent_user_fail
     * Description: Login attempt with email not in database should return 401 Unauthorized
     */
    it('should fail when logging in with non-existent email (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      const body = response.body as ErrorResponse;

      expect(response.body).toHaveProperty('message');
      expect(body.message).toContain('Invalid');
    });

    /**
     * Test Case: Login with missing credentials - Fail
     * Name: login_missing_credentials_fail
     * Description: Login without email or password should return 400 Bad Request
     */
    it('should fail when logging in without email (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({
          password: 'SomePassword123!',
        })
        .expect(400);
    });

    it('should fail when logging in without password (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('Protected Routes Authorization', () => {
    /**
     * Test Case: Access protected route with valid token - Success
     * Name: protected_route_valid_token_success
     * Description: Accessing /clients with valid JWT token should return 200 OK
     */
    it('should allow access to protected route with valid JWT token', async () => {
      const user = await registerUser(app);

      await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(user.token!))
        .expect(200);
    });

    /**
     * Test Case: Access protected route without token - Fail
     * Name: protected_route_no_token_fail
     * Description: Accessing protected route without Authorization header should return 401 Unauthorized
     */
    it('should deny access to protected route without token (401 Unauthorized)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients')
        .expect(401);
    });

    /**
     * Test Case: Access protected route with invalid token - Fail
     * Name: protected_route_invalid_token_fail
     * Description: Accessing protected route with malformed JWT should return 401 Unauthorized
     */
    it('should deny access to protected route with invalid token (401 Unauthorized)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders('invalid-token-123'))
        .expect(401);
    });

    /**
     * Test Case: Access protected route with expired token - Fail
     * Name: protected_route_expired_token_fail
     * Description: Accessing protected route with expired JWT should return 401 Unauthorized
     */
    it('should deny access to protected route with malformed Bearer format (401 Unauthorized)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients')
        .set({ Authorization: 'NotBearer invalid-token' })
        .expect(401);
    });

    /**
     * Test Case: Multiple logins generate different tokens - Success
     * Name: multiple_logins_different_tokens
     * Description: Logging in multiple times should generate new valid tokens each time
     */
    it('should generate different tokens for multiple logins of same user', async () => {
      const user = await registerUser(app);

      const login1 = await loginUser(app, user.email, user.password);

      // Wait 1 second to ensure different iat (issued at) timestamp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const login2 = await loginUser(app, user.email, user.password);

      expect(login1.token).not.toBe(login2.token);
      expect(login1.userId).toBe(login2.userId);

      // Both tokens should be valid
      await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(login1.token))
        .expect(200);

      await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(login2.token))
        .expect(200);
    });
  });
});
