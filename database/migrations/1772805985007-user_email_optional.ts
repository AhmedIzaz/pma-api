import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEmailOptional1772805985007 implements MigrationInterface {
    name = 'UserEmailOptional1772805985007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userEmail\` \`userEmail\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userEmail\` \`userEmail\` varchar(100) NOT NULL`);
    }

}
