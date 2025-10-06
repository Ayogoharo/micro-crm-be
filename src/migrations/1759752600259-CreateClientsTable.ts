import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsTable1759752600259 implements MigrationInterface {
  name = 'CreateClientsTable1759752600259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_59c1e5e51addd6ebebf76230b3"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_59c1e5e51addd6ebebf76230b3" ON "clients" ("userId") `,
    );
  }
}
