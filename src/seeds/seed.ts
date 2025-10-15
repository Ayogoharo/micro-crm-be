import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Client } from '../clients/entities/client.entity';
import { AuthProvider } from '../users/enums/auth-provider.enum';
import { SubscriptionPlan } from '../users/enums/subscription-plan.enum';
import { hashPassword } from '../auth/utils/hash.util';
import dataSource from '../data-source';

/**
 * Generate a random number of clients for each user (between 8 and 25)
 */
function getRandomClientCount(): number {
  return faker.number.int({ min: 8, max: 25 });
}

/**
 * Generate a random number of users (between 3 and 5)
 */
function getRandomUserCount(): number {
  return faker.number.int({ min: 3, max: 5 });
}

/**
 * Create a user with fake data
 */
async function createUser(): Promise<User> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const password = 'Password123!'; // Common password for all seed users
  const passwordHash = await hashPassword(password);

  const user = new User();
  user.email = email;
  user.passwordHash = passwordHash;
  user.provider = AuthProvider.LOCAL;
  user.plan = faker.helpers.arrayElement([
    SubscriptionPlan.FREE,
    SubscriptionPlan.PRO,
  ]);

  return user;
}

/**
 * Create a client with fake data for a given user
 */
function createClient(user: User): Client {
  const client = new Client();
  client.name = faker.person.fullName();
  client.email =
    faker.helpers.maybe(() => faker.internet.email(), {
      probability: 0.8,
    }) ?? null;
  client.phone =
    faker.helpers.maybe(() => faker.phone.number(), {
      probability: 0.7,
    }) ?? null;
  client.notes =
    faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), {
      probability: 0.5,
    }) ?? null;
  client.user = user;
  client.userId = user.id;

  return client;
}

/**
 * Main seeding function
 */
async function seed() {
  let connection: DataSource | null = null;

  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    connection = await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Get repositories
    const userRepository = connection.getRepository(User);
    const clientRepository = connection.getRepository(Client);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    // Use CASCADE to handle foreign key constraints
    await connection.query(
      'TRUNCATE TABLE "clients", "users" RESTART IDENTITY CASCADE',
    );
    console.log('✅ Existing data cleared\n');

    // Generate users
    const userCount = getRandomUserCount();
    console.log(`👥 Generating ${userCount} users...`);

    const users: User[] = [];
    for (let i = 0; i < userCount; i++) {
      const user = await createUser();
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
      console.log(
        `  ✓ Created user ${i + 1}/${userCount}: ${savedUser.email} (${savedUser.plan})`,
      );
    }

    console.log(`✅ ${users.length} users created\n`);

    // Generate clients for each user
    console.log('👤 Generating clients for each user...');
    let totalClients = 0;

    for (const user of users) {
      const clientCount = getRandomClientCount();
      const clients: Client[] = [];

      for (let i = 0; i < clientCount; i++) {
        const client = createClient(user);
        clients.push(client);
      }

      await clientRepository.save(clients);
      totalClients += clientCount;

      console.log(
        `  ✓ Created ${clientCount} clients for ${user.email} (Total: ${totalClients})`,
      );
    }

    console.log(`✅ ${totalClients} clients created\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Clients: ${totalClients}`);
    console.log(
      `  • Average clients per user: ${Math.round(totalClients / users.length)}`,
    );
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('  Password for all users: Password123!');
    console.log('  Emails:');
    users.forEach((user) => {
      console.log(`    - ${user.email}`);
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (connection && connection.isInitialized) {
      await connection.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the seed function
seed();
