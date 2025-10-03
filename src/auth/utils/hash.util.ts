import * as bcrypt from 'bcrypt';

/**
 * Number of salt rounds for bcrypt password hashing.
 */
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param {string} password - The plain text password to hash
 *
 * @returns {Promise<string>} A promise that resolves with the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The hashed password to compare against
 *
 * @returns {Promise<boolean>} A promise that resolves with true if passwords match, false otherwise
 */
export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
