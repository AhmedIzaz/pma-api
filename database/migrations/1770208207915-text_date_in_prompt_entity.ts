import { MigrationInterface, QueryRunner } from "typeorm";

export class TextDateInPromptEntity1770208207915 implements MigrationInterface {
    name = 'TextDateInPromptEntity1770208207915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`text\``);
    }

}
