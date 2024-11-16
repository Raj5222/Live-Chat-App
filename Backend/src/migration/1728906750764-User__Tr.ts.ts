import { MigrationInterface, QueryRunner } from "typeorm";
import { location_arr } from "../temp";

export class User_Trts1728906750764 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
          `CREATE OR REPLACE FUNCTION User_Table_Trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS
$$
DECLARE
    column_names TEXT;
    value_names TEXT;
    sql TEXT;
BEGIN
    BEGIN
    
        SELECT ARRAY_TO_STRING(ARRAY_AGG(quote_ident(column_name) ORDER BY ordinal_position), ', ') INTO column_names
        FROM information_schema.columns
        WHERE table_name = 'user_tr'
        AND column_name NOT IN ('user_tr_id', 'location', 'Created_At');

        SELECT ARRAY_TO_STRING(ARRAY_AGG('NEW.' || quote_ident(column_name) ORDER BY ordinal_position), ', ') INTO value_names
        FROM information_schema.columns
        WHERE table_name = 'user_tr'
        AND column_name NOT IN ('user_tr_id', 'location', 'Created_At');

        
        sql := 'INSERT INTO user_tr (' || column_names || ') VALUES (' || value_names || ')';

        
        EXECUTE sql;
        
        RETURN NEW;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error in User_Table_Trigger: %', SQLERRM;
            RETURN NULL;
    END;
END;
$$;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
