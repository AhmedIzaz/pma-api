import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstAidRelRenamed1770296396079 implements MigrationInterface {
    name = 'FirstAidRelRenamed1770296396079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_dcefb8164dd78cec2fad1c65b8c\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidCodeId\` \`firstAidId\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_b441fa888b783a5f87b9bf0c356\` FOREIGN KEY (\`firstAidId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_b441fa888b783a5f87b9bf0c356\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidId\` \`firstAidCodeId\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_dcefb8164dd78cec2fad1c65b8c\` FOREIGN KEY (\`firstAidCodeId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
