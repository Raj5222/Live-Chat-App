import { MigrationInterface, QueryRunner } from "typeorm";
import { location_arr } from "../temp";

export class UserTrts1728897062280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION User_Table_Trigger()
      RETURNS TRIGGER 
      LANGUAGE PLPGSQL
      AS
      $$
      BEGIN
      INSERT INTO "user_tr"(user_u_id, name,location)
      VALUES (NEW.user_u_id, NEW.firstname,'${location_arr}');      
      RETURN NEW;
      END;
      $$;
      `
    );

    await queryRunner.query(
      `CREATE TRIGGER after_user_insert
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION User_Table_Trigger();
`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION User_Table_Trigger;`);
    await queryRunner.query(`DROP TRIGGER after_user_insert;`);
  }
}
