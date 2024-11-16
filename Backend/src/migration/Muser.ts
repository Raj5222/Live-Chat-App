import { MigrationInterface, QueryRunner } from "typeorm";
import Crypto from "../Services/crypto";
import { generateToken } from "../Services/jwt";

export class Mstaff9181002100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    
await queryRunner.query(
  `INSERT INTO "user" (firstname, lastname, password, email, jwt_token, mobile,u_id,role,status) 
      VALUES ('Raj', 'Sathvara', '${await Crypto.encrypt(
        "0206"
      )}', 'raj@gmail.com', '${generateToken(
    "Raj0001"
  )}',8154005222,'Raj0001','1',true)`
);


  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user"`);
  }
}