import { MigrationInterface, QueryRunner } from "typeorm";

export class Payment1777997506735 implements MigrationInterface {
    name = 'Payment1777997506735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tran_id\` varchar(100) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(10) NOT NULL DEFAULT 'BDT', \`status\` enum ('INIT', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'INIT', \`user_id\` int NULL, \`val_id\` varchar(100) NULL, \`raw_response\` json NULL, \`consultationId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_5afeaa53beaa5d712a87f05ad4\` (\`tran_id\`), UNIQUE INDEX \`REL_1a957dd108a1f8071f8c8444dc\` (\`consultationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_1a957dd108a1f8071f8c8444dc0\` FOREIGN KEY (\`consultationId\`) REFERENCES \`consultations\`(\`consultationId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_1a957dd108a1f8071f8c8444dc0\``);
        await queryRunner.query(`DROP INDEX \`REL_1a957dd108a1f8071f8c8444dc\` ON \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_5afeaa53beaa5d712a87f05ad4\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
    }

}
