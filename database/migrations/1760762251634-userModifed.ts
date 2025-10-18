import { MigrationInterface, QueryRunner } from "typeorm";

export class UserModifed1760762251634 implements MigrationInterface {
    name = 'UserModifed1760762251634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`userEmail\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_9047b2d58f91586f14f0cf44a4\` (\`userEmail\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`userPassword\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`userRegistrationType\` enum ('Google') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`userRegistrationType\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`userPassword\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_9047b2d58f91586f14f0cf44a4\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`userEmail\``);
    }

}
