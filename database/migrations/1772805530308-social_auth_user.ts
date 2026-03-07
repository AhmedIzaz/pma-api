import { MigrationInterface, QueryRunner } from "typeorm";

export class SocialAuthUser1772805530308 implements MigrationInterface {
    name = 'SocialAuthUser1772805530308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`socialAuthId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_268afba1bb60da1064fb43c555\` (\`socialAuthId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_268afba1bb60da1064fb43c555\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`socialAuthId\``);
    }

}
