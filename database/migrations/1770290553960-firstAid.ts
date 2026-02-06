import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstAid1770290553960 implements MigrationInterface {
    name = 'FirstAid1770290553960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`first_aid_entity\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`description\` json NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a734dc3784fc6e1aac136903f8\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a734dc3784fc6e1aac136903f8\` ON \`first_aid_entity\``);
        await queryRunner.query(`DROP TABLE \`first_aid_entity\``);
    }

}
