import { MigrationInterface, QueryRunner } from "typeorm";

export class MRole1696010000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Inserting a new role
    await queryRunner.query(`
      INSERT INTO role(role)
      VALUES
      ('Super Admin'),('Admin'),('Staff'),('Customer');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Deleting the inserted role
    await queryRunner.query(`DELETE FROM role`);
  }
}
