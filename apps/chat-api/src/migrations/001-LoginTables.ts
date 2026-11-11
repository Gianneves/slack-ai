import { MigrationInterface, QueryRunner } from "typeorm";

export class LoginTables1794263872499 implements MigrationInterface {
    name = 'LoginTables1794263872499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "people" ("id" uuid NOT NULL, "email" text NOT NULL, "name" text NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aa866e71353ee94c6cc51059c5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c77e8752faa45901af2b245dff" ON "people"  ("email") `);
        await queryRunner.query(`CREATE TABLE "login_attempts" ("id" uuid NOT NULL, "email" text NOT NULL, "failed_attempts" integer NOT NULL, "first_failed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "blocked_until" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_070e613c8f768b1a70742705c5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0aedff58b23995504f9dc99f75" ON "login_attempts"  ("email") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL, "person_id" uuid NOT NULL, "token_hash" character(64) NOT NULL, "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c3942eab830cae599a763e1155" ON "sessions"  ("person_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abaa9e068cdd390bc5210f7988" ON "sessions"  ("token_hash") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_abaa9e068cdd390bc5210f7988"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3942eab830cae599a763e1155"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0aedff58b23995504f9dc99f75"`);
        await queryRunner.query(`DROP TABLE "login_attempts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c77e8752faa45901af2b245dff"`);
        await queryRunner.query(`DROP TABLE "people"`);
    }

}
