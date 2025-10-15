/**
 * Global setup for E2E tests
 * This file runs once before all test suites
 */

// Register tsconfig-paths to resolve src/* paths
import 'tsconfig-paths/register';

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default async function globalSetup() {
  console.log('🔧 E2E Test Setup: Initializing test database...');

  // Create a connection to PostgreSQL (not to specific database)
  const postgresConnection = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5434', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    await postgresConnection.initialize();

    const databaseName = process.env.DATABASE_NAME || 'micro_crm_test';

    // Check if test database exists
    const result = await postgresConnection.query<
      Array<{ '?column?': number }>
    >(`SELECT 1 FROM pg_database WHERE datname = $1`, [databaseName]);

    if (result.length === 0) {
      // Create test database if it doesn't exist
      console.log(`📦 Creating test database: ${databaseName}`);
      await postgresConnection.query(`CREATE DATABASE ${databaseName}`);
    } else {
      console.log(`✅ Test database already exists: ${databaseName}`);
    }

    await postgresConnection.destroy();

    // Now connect to the test database and run migrations
    const testDbConnection = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5434', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: databaseName,
      entities: [path.resolve(__dirname, '../src/**/*.entity{.ts,.js}')],
      migrations: [path.resolve(__dirname, '../src/migrations/*{.ts,.js}')],
      synchronize: false,
    });

    await testDbConnection.initialize();

    // Run migrations
    console.log('🔄 Running migrations on test database...');
    await testDbConnection.runMigrations();
    console.log('✅ Migrations completed successfully');

    await testDbConnection.destroy();

    console.log('✅ E2E Test Setup Complete\n');
  } catch (error) {
    console.error('❌ E2E Test Setup Failed:', error);
    throw error;
  }
}
