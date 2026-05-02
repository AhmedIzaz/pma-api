import { MigrationInterface, QueryRunner } from "typeorm";

export class DoctorModule1777698773559 implements MigrationInterface {
    name = 'DoctorModule1777698773559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`doctor_services\` (\`serviceId\` int NOT NULL AUTO_INCREMENT, \`serviceName\` varchar(100) NOT NULL, \`costPerHour\` decimal(10,2) NOT NULL, \`durationHours\` int NOT NULL DEFAULT '1', \`totalCost\` decimal(10,2) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`doctorId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`serviceId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`consultations\` (\`consultationId\` int NOT NULL AUTO_INCREMENT, \`doctorId\` int NOT NULL, \`userId\` int NULL, \`serviceId\` int NULL, \`startTime\` timestamp NOT NULL, \`endTime\` timestamp NULL, \`durationMinutes\` int NOT NULL DEFAULT '0', \`amountEarned\` decimal(10,2) NOT NULL DEFAULT '0.00', \`status\` enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`consultationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`doctors\` (\`doctorId\` int NOT NULL AUTO_INCREMENT, \`doctorName\` varchar(100) NOT NULL, \`doctorEmail\` varchar(100) NOT NULL, \`doctorPassword\` varchar(255) NOT NULL, \`specialization\` varchar(100) NULL, \`qualifications\` varchar(255) NULL, \`phoneNumber\` varchar(20) NULL, \`bio\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4d8cbaaf4fb9de3c8db9731a82\` (\`doctorEmail\`), PRIMARY KEY (\`doctorId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`doctor_services\` ADD CONSTRAINT \`FK_6653740044b8631cfcaeac70e22\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`doctorId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_9dc2a125f0cf9cacd9f908ba2a8\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`doctorId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_9dc2a125f0cf9cacd9f908ba2a8\``);
        await queryRunner.query(`ALTER TABLE \`doctor_services\` DROP FOREIGN KEY \`FK_6653740044b8631cfcaeac70e22\``);
        await queryRunner.query(`DROP INDEX \`IDX_4d8cbaaf4fb9de3c8db9731a82\` ON \`doctors\``);
        await queryRunner.query(`DROP TABLE \`doctors\``);
        await queryRunner.query(`DROP TABLE \`consultations\``);
        await queryRunner.query(`DROP TABLE \`doctor_services\``);
    }

}
