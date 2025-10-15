import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  registerUser,
  getAuthHeaders,
  createMultipleClients,
  createClient,
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

describe('Clients Pagination & Search (e2e)', () => {
  let app: INestApplication;
  let user: TestUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create test user
    user = await registerUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /clients - Pagination', () => {
    beforeAll(async () => {
      // Create 25 test clients for pagination testing
      await createMultipleClients(app, user.token!, 25);
    });

    /**
     * Test Case: Get first page with default limit - Success
     * Name: pagination_first_page_default
     * Description: Fetching clients without params should return first page with default limit of 10
     */
    it('should return first page with default limit (10 items)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(body.data.length).toBeLessThanOrEqual(10);
      expect(body.total).toBeGreaterThanOrEqual(25);
    });

    /**
     * Test Case: Get first page explicitly - Success
     * Name: pagination_explicit_first_page
     * Description: Requesting page=1 should return first 10 clients
     */
    it('should return first page when explicitly requesting page 1', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.data.length).toBe(10);
    });

    /**
     * Test Case: Get second page - Success
     * Name: pagination_second_page
     * Description: Requesting page=2 should return different clients than page 1
     */
    it('should return second page with different clients', async () => {
      const page1Response = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page2Response = await request(app.getHttpServer() as Server)
        .get('/clients?page=2&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page1Body = page1Response.body as PaginatedResponse<TestClient>;
      const page2Body = page2Response.body as PaginatedResponse<TestClient>;

      expect(page2Body.page).toBe(2);
      expect(page2Body.limit).toBe(10);
      expect(page2Body.data.length).toBe(10);

      // Verify page 2 has different clients than page 1
      const page1Ids = page1Body.data.map((c) => c.id);
      const page2Ids = page2Body.data.map((c) => c.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });

    /**
     * Test Case: Get third page - Success
     * Name: pagination_third_page
     * Description: Requesting page=3 should return remaining clients
     */
    it('should return third page with remaining clients', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=3&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(3);
      expect(body.limit).toBe(10);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(10);
    });

    /**
     * Test Case: Get page with custom limit 5 - Success
     * Name: pagination_custom_limit_5
     * Description: Requesting limit=5 should return only 5 clients per page
     */
    it('should respect custom limit of 5 items per page', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=5')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(1);
      expect(body.limit).toBe(5);
      expect(body.data.length).toBe(5);
    });

    /**
     * Test Case: Get page with custom limit 25 - Success
     * Name: pagination_custom_limit_25
     * Description: Requesting limit=25 should return up to 25 clients
     */
    it('should respect custom limit of 25 items per page', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=25')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(1);
      expect(body.limit).toBe(25);
      expect(body.data.length).toBeGreaterThanOrEqual(25);
    });

    /**
     * Test Case: Get page with custom limit 50 - Success
     * Name: pagination_custom_limit_50
     * Description: Requesting limit=50 should return all clients if total < 50
     */
    it('should respect custom limit of 50 items per page', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=50')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(1);
      expect(body.limit).toBe(50);
      expect(body.data.length).toBeLessThanOrEqual(50);
    });

    /**
     * Test Case: Get page beyond available data - Success
     * Name: pagination_page_beyond_data
     * Description: Requesting page beyond total pages should return empty array
     */
    it('should return empty array for page beyond available data', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=999&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.page).toBe(999);
      expect(body.data).toEqual([]);
      expect(body.total).toBeGreaterThan(0);
    });

    /**
     * Test Case: Total count accuracy - Success
     * Name: pagination_total_count_accurate
     * Description: Total count should be consistent across all pages
     */
    it('should return consistent total count across different pages', async () => {
      const page1 = await request(app.getHttpServer() as Server)
        .get('/clients?page=1&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page2 = await request(app.getHttpServer() as Server)
        .get('/clients?page=2&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page1Body = page1.body as PaginatedResponse<TestClient>;
      const page2Body = page2.body as PaginatedResponse<TestClient>;

      expect(page1Body.total).toBe(page2Body.total);
      expect(page1Body.total).toBeGreaterThanOrEqual(25);
    });
  });

  describe('GET /clients?search - Search Functionality', () => {
    beforeAll(async () => {
      // Create clients with specific names for search testing
      await createClient(app, user.token!, { name: 'Alice Johnson' });
      await createClient(app, user.token!, { name: 'Bob Smith' });
      await createClient(app, user.token!, { name: 'Charlie Brown' });
      await createClient(app, user.token!, { name: 'alice cooper' });
      await createClient(app, user.token!, { name: 'ALICE WALKER' });
      await createClient(app, user.token!, { name: 'John Doe' });
      await createClient(app, user.token!, { name: 'Jane Smith' });
    });

    /**
     * Test Case: Search by exact name - Success
     * Name: search_exact_name
     * Description: Searching for exact client name should return matching client
     */
    it('should find client by exact name match', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=Alice Johnson')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data.length).toBeGreaterThan(0);
      const names = body.data.map((c) => c.name);
      expect(names).toContain('Alice Johnson');
    });

    /**
     * Test Case: Search case-insensitive - Success
     * Name: search_case_insensitive
     * Description: Search should be case-insensitive (alice matches Alice, ALICE, alice)
     */
    it('should perform case-insensitive search', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=alice')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data.length).toBeGreaterThanOrEqual(3);
      const names = body.data.map((c) => c.name?.toLowerCase() ?? '');

      // Should find Alice Johnson, alice cooper, and ALICE WALKER
      const aliceCount = names.filter((name) => name.includes('alice')).length;
      expect(aliceCount).toBeGreaterThanOrEqual(3);
    });

    /**
     * Test Case: Search with partial match - Success
     * Name: search_partial_match
     * Description: Partial name search should return all clients containing the search term
     */
    it('should find clients with partial name match', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=Smith')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data.length).toBeGreaterThanOrEqual(2);
      const names = body.data.map((c) => c.name);
      expect(names).toContain('Bob Smith');
      expect(names).toContain('Jane Smith');
    });

    /**
     * Test Case: Search with single character - Success
     * Name: search_single_character
     * Description: Single character search should return clients with that character in name
     */
    it('should find clients with single character search', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=J')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      const names = body.data.map((c) => c.name);
      // Should include John, Jane, Alice Johnson
      const jNames = names.filter((name) => name?.toLowerCase().includes('j'));
      expect(jNames.length).toBeGreaterThan(0);
    });

    /**
     * Test Case: Search with no results - Success
     * Name: search_no_results
     * Description: Search with no matching clients should return empty array
     */
    it('should return empty array when search has no results', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=NonExistentClientName123456')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data).toEqual([]);
      expect(body.total).toBe(0);
    });

    /**
     * Test Case: Search with special characters - Success
     * Name: search_special_characters
     * Description: Search should handle special characters safely
     */
    it('should handle search with special characters safely', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=%')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      // Should not crash and return valid response
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });

    /**
     * Test Case: Search respects user isolation - Success
     * Name: search_user_isolation
     * Description: Search should only return clients belonging to authenticated user
     */
    it('should only search within authenticated users clients', async () => {
      // Create another user with client
      const otherUser = await registerUser(app);
      await createClient(app, otherUser.token!, { name: 'Other User Client' });

      // Search from first user
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=Other User Client')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.data).toEqual([]);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /clients - Pagination with Search', () => {
    beforeAll(async () => {
      // Create many clients with "Test" in name for pagination + search testing
      for (let i = 1; i <= 20; i++) {
        await createClient(app, user.token!, { name: `Test Client ${i}` });
      }
    });

    /**
     * Test Case: Pagination works with search - Success
     * Name: search_with_pagination
     * Description: Search results should support pagination
     */
    it('should paginate search results correctly', async () => {
      const page1 = await request(app.getHttpServer() as Server)
        .get('/clients?search=Test Client&page=1&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page2 = await request(app.getHttpServer() as Server)
        .get('/clients?search=Test Client&page=2&limit=10')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const page1Body = page1.body as PaginatedResponse<TestClient>;
      const page2Body = page2.body as PaginatedResponse<TestClient>;

      expect(page1Body.data.length).toBe(10);
      expect(page2Body.data.length).toBe(10);
      expect(page1Body.total).toBe(page2Body.total);
      expect(page1Body.total).toBeGreaterThanOrEqual(20);

      // Verify different clients on different pages
      const page1Ids = page1Body.data.map((c) => c.id);
      const page2Ids = page2Body.data.map((c) => c.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });

    /**
     * Test Case: Total count reflects search filter - Success
     * Name: search_total_count_filtered
     * Description: Total count in response should reflect filtered search results, not all clients
     */
    it('should return total count reflecting search filter', async () => {
      // Get total without search
      const allClients = await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      // Get total with search
      const searchResults = await request(app.getHttpServer() as Server)
        .get('/clients?search=Test Client')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const allBody = allClients.body as PaginatedResponse<TestClient>;
      const searchBody = searchResults.body as PaginatedResponse<TestClient>;

      expect(searchBody.total).toBeLessThan(allBody.total);
      expect(searchBody.total).toBeGreaterThanOrEqual(20);
    });

    /**
     * Test Case: Search with custom limit - Success
     * Name: search_custom_limit
     * Description: Search should respect custom page size limits
     */
    it('should respect custom limit when searching', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?search=Test&limit=5')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const body = response.body as PaginatedResponse<TestClient>;

      expect(body.limit).toBe(5);
      expect(body.data.length).toBe(5);
    });

    /**
     * Test Case: Empty search returns all clients - Success
     * Name: empty_search_returns_all
     * Description: Empty search parameter should return all clients (no filtering)
     */
    it('should return all clients when search is empty string', async () => {
      const allClients = await request(app.getHttpServer() as Server)
        .get('/clients')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const emptySearch = await request(app.getHttpServer() as Server)
        .get('/clients?search=')
        .set(getAuthHeaders(user.token!))
        .expect(200);

      const allBody = allClients.body as PaginatedResponse<TestClient>;
      const emptyBody = emptySearch.body as PaginatedResponse<TestClient>;

      expect(emptyBody.total).toBe(allBody.total);
    });
  });

  describe('GET /clients - Invalid Pagination Parameters', () => {
    /**
     * Test Case: Invalid page parameter - Fail
     * Name: pagination_invalid_page_fail
     * Description: Non-numeric page parameter should return 400 Bad Request
     */
    it('should fail with non-numeric page parameter (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients?page=invalid')
        .set(getAuthHeaders(user.token!))
        .expect(400);
    });

    /**
     * Test Case: Invalid limit parameter - Fail
     * Name: pagination_invalid_limit_fail
     * Description: Non-numeric limit parameter should return 400 Bad Request
     */
    it('should fail with non-numeric limit parameter (400 Bad Request)', async () => {
      await request(app.getHttpServer() as Server)
        .get('/clients?limit=invalid')
        .set(getAuthHeaders(user.token!))
        .expect(400);
    });

    /**
     * Test Case: Negative page number - Behavior verification
     * Name: pagination_negative_page
     * Description: Negative page number should be handled gracefully
     */
    it('should handle negative page number gracefully', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=-1')
        .set(getAuthHeaders(user.token!));

      // Should either reject (400) or treat as page 1
      expect([200, 400]).toContain(response.status);
    });

    /**
     * Test Case: Zero as page number - Behavior verification
     * Name: pagination_zero_page
     * Description: Zero as page number should be handled gracefully
     */
    it('should handle zero as page number gracefully', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/clients?page=0')
        .set(getAuthHeaders(user.token!));

      // Should either reject (400) or treat as page 1
      expect([200, 400]).toContain(response.status);
    });
  });
});
