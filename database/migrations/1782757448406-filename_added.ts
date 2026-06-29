import { MigrationInterface, QueryRunner } from "typeorm";

export class FilenameAdded1782757448406 implements MigrationInterface {
    name = 'FilenameAdded1782757448406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prescription\` ADD \`fileName\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP COLUMN \`fileName\``);
    }

}
