import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsTable1759498222168 implements MigrationInterface {
  name = 'CreateClientsTable1759498222168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(50), "notes" text, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59c1e5e51addd6ebebf76230b3" ON "clients" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_59c1e5e51addd6ebebf76230b37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_59c1e5e51addd6ebebf76230b37"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_59c1e5e51addd6ebebf76230b3"`,
    );
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
