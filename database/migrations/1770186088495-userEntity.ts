import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1770186088495 implements MigrationInterface {
    name = 'UserEntity1770186088495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`prompt_entity\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`userUserId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_9bbc9624cb025178dfbcd591a48\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_9bbc9624cb025178dfbcd591a48\``);
        await queryRunner.query(`DROP TABLE \`prompt_entity\``);
    }

}
