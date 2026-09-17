import { MigrationInterface, QueryRunner } from "typeorm";

export class PrescriptionAdded1782752037453 implements MigrationInterface {
    name = 'PrescriptionAdded1782752037453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`prescription\` (\`prescriptionId\` int NOT NULL AUTO_INCREMENT, \`consultationId\` int NOT NULL, \`fileRef\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`prescriptionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD \`diagnosis\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` ADD CONSTRAINT \`FK_5de72626956a6994f003aa5b15d\` FOREIGN KEY (\`consultationId\`) REFERENCES \`consultations\`(\`consultationId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP FOREIGN KEY \`FK_5de72626956a6994f003aa5b15d\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP COLUMN \`diagnosis\``);
        await queryRunner.query(`DROP TABLE \`prescription\``);
    }

}
