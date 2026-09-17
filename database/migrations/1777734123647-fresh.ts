import { MigrationInterface, QueryRunner } from "typeorm";

export class Fresh1777734123647 implements MigrationInterface {
    name = 'Fresh1777734123647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`doctor_services\` (\`serviceId\` int NOT NULL AUTO_INCREMENT, \`serviceName\` varchar(100) NOT NULL, \`costPerHour\` decimal(10,2) NOT NULL, \`durationHours\` int NOT NULL DEFAULT '1', \`totalCost\` decimal(10,2) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`doctorId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`serviceId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`doctors\` (\`doctorId\` int NOT NULL AUTO_INCREMENT, \`doctorName\` varchar(100) NOT NULL, \`doctorEmail\` varchar(100) NOT NULL, \`doctorPassword\` varchar(255) NOT NULL, \`specialization\` varchar(100) NULL, \`qualifications\` varchar(255) NULL, \`phoneNumber\` varchar(20) NULL, \`bio\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4d8cbaaf4fb9de3c8db9731a82\` (\`doctorEmail\`), PRIMARY KEY (\`doctorId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`first_aid_entity\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`description\` json NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a734dc3784fc6e1aac136903f8\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`prompt_entity\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`generatedBy\` enum ('USER', 'SYSTEM') NOT NULL, \`text\` text NULL, \`triageLevel\` enum ('HIGH', 'MEDIUM', 'LOW') NULL, \`firstAidString\` text NULL, \`hospitalLookupNeeded\` tinyint NULL, \`userUserId\` int NULL, \`firstAidId\` bigint NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`userName\` varchar(100) NOT NULL, \`userEmail\` varchar(100) NULL, \`userPassword\` varchar(255) NULL, \`userRegistrationType\` enum ('Google') NULL, \`socialAuthId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9047b2d58f91586f14f0cf44a4\` (\`userEmail\`), UNIQUE INDEX \`IDX_268afba1bb60da1064fb43c555\` (\`socialAuthId\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`consultations\` (\`consultationId\` int NOT NULL AUTO_INCREMENT, \`doctorId\` int NOT NULL, \`userId\` int NULL, \`serviceId\` int NULL, \`startTime\` timestamp NOT NULL, \`endTime\` timestamp NULL, \`durationMinutes\` int NOT NULL DEFAULT '0', \`requestedDurationHours\` int NULL, \`amountEarned\` decimal(10,2) NOT NULL DEFAULT '0.00', \`status\` enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`consultationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`doctor_services\` ADD CONSTRAINT \`FK_6653740044b8631cfcaeac70e22\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`doctorId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_9bbc9624cb025178dfbcd591a48\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_b441fa888b783a5f87b9bf0c356\` FOREIGN KEY (\`firstAidId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_9dc2a125f0cf9cacd9f908ba2a8\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\`(\`doctorId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_e5b6a3f67f026ba680ec7934d9e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_bfe711405403ccec6e83109d5be\` FOREIGN KEY (\`serviceId\`) REFERENCES \`doctor_services\`(\`serviceId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_bfe711405403ccec6e83109d5be\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_e5b6a3f67f026ba680ec7934d9e\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_9dc2a125f0cf9cacd9f908ba2a8\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_b441fa888b783a5f87b9bf0c356\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_9bbc9624cb025178dfbcd591a48\``);
        await queryRunner.query(`ALTER TABLE \`doctor_services\` DROP FOREIGN KEY \`FK_6653740044b8631cfcaeac70e22\``);
        await queryRunner.query(`DROP TABLE \`consultations\``);
        await queryRunner.query(`DROP INDEX \`IDX_268afba1bb60da1064fb43c555\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_9047b2d58f91586f14f0cf44a4\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`prompt_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_a734dc3784fc6e1aac136903f8\` ON \`first_aid_entity\``);
        await queryRunner.query(`DROP TABLE \`first_aid_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_4d8cbaaf4fb9de3c8db9731a82\` ON \`doctors\``);
        await queryRunner.query(`DROP TABLE \`doctors\``);
        await queryRunner.query(`DROP TABLE \`doctor_services\``);
    }

}
