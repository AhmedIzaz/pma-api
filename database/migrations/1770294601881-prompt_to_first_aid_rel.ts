import { MigrationInterface, QueryRunner } from "typeorm";

export class PromptToFirstAidRel1770294601881 implements MigrationInterface {
    name = 'PromptToFirstAidRel1770294601881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidCode\` \`firstAidCodeId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`firstAidCodeId\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`firstAidCodeId\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_dcefb8164dd78cec2fad1c65b8c\` FOREIGN KEY (\`firstAidCodeId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_dcefb8164dd78cec2fad1c65b8c\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`firstAidCodeId\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`firstAidCodeId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidCodeId\` \`firstAidCode\` varchar(255) NULL`);
    }

}
