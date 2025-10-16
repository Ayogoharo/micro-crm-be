/**
 * JWT token payload structure.
 */
export interface JwtPayload {
  /** User ID */
  sub: string;
  /** User email address */
  email: string;
}
