import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstAifStringNullable1773772864490 implements MigrationInterface {
    name = 'FirstAifStringNullable1773772864490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidString\` \`firstAidString\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidString\` \`firstAidString\` text NOT NULL`);
    }

}
