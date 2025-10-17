/**
 * Setup environment variables for each test file
 * This runs before each test file (not globally like setup-e2e.ts)
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables with override to ensure .env.test takes precedence over .env
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
});

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';
