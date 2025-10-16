/**
 * Global teardown for E2E tests
 * This file runs once after all test suites complete
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default async function globalTeardown() {
  console.log('\n🧹 E2E Test Teardown: Cleaning up test database...');

  const databaseName = process.env.DATABASE_NAME || 'micro_crm_test';

  // Connect to the test database to drop all data
  const testDbConnection = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5434', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: databaseName,
  });

  try {
    await testDbConnection.initialize();

    // Get all table names
    const tables = await testDbConnection.query<{ tablename: string }[]>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    if (tables.length > 0) {
      console.log(`🗑️  Clearing ${tables.length} tables...`);

      // Disable foreign key checks temporarily
      await testDbConnection.query('SET session_replication_role = replica;');

      // Truncate all tables
      for (const table of tables) {
        if (table.tablename !== 'migrations') {
          // Keep migrations table
          await testDbConnection.query(
            `TRUNCATE TABLE "${table.tablename}" CASCADE`,
          );
        }
      }

      // Re-enable foreign key checks
      await testDbConnection.query('SET session_replication_role = DEFAULT;');
    }

    await testDbConnection.destroy();

    console.log('✅ E2E Test Teardown Complete');
  } catch (error) {
    console.error('❌ E2E Test Teardown Failed:', error);
    // Don't throw - allow tests to complete even if cleanup fails
  }
}
