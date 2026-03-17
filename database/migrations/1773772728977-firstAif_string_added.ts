import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstAifStringAdded1773772728977 implements MigrationInterface {
    name = 'FirstAifStringAdded1773772728977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD \`firstAidString\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP COLUMN \`firstAidString\``);
    }

}
