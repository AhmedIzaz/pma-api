import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstAidTrigaeLvlHsptalLookupInPromptEntity1770209898636 implements MigrationInterface {
    name = 'FirstAidTrigaeLvlHsptalLookupInPromptEntity1770209898636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`generatedBy\` enum ('USER', 'SYSTEM') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`triageLevel\` enum ('HIGH', 'MEDIUM', 'LOW') NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`firstAidCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`hospitalLookupNeeded\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`text\` \`text\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`text\` \`text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`hospitalLookupNeeded\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`firstAidCode\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`triageLevel\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`generatedBy\``);
    }

}
