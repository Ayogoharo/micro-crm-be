import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1759329285591 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Initial migration - no changes needed yet
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Initial migration - no changes needed yet
  }
}
