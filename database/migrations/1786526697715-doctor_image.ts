import { MigrationInterface, QueryRunner } from "typeorm";

export class DoctorImage1786526697715 implements MigrationInterface {
    name = 'DoctorImage1786526697715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`doctors\` ADD \`doctorImageUrl\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_9bbc9624cb025178dfbcd591a48\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_b441fa888b783a5f87b9bf0c356\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`text\` \`text\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`triageLevel\` \`triageLevel\` enum ('HIGH', 'MEDIUM', 'LOW') NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidString\` \`firstAidString\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`hospitalLookupNeeded\` \`hospitalLookupNeeded\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`userUserId\` \`userUserId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidId\` \`firstAidId\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userEmail\` \`userEmail\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userPassword\` \`userPassword\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userRegistrationType\` \`userRegistrationType\` enum ('Google') NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`socialAuthId\` \`socialAuthId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`specialization\` \`specialization\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`qualifications\` \`qualifications\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`bio\` \`bio\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_e5b6a3f67f026ba680ec7934d9e\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_bfe711405403ccec6e83109d5be\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`serviceId\` \`serviceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`endTime\` \`endTime\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`requestedDurationHours\` \`requestedDurationHours\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`diagnosis\` \`diagnosis\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_1a957dd108a1f8071f8c8444dc0\``);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`val_id\` \`val_id\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`raw_response\``);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD \`raw_response\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`consultationId\` \`consultationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`fileName\` \`fileName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`fileHash\` \`fileHash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`blockchainTxHash\` \`blockchainTxHash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`blockchainId\` \`blockchainId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_9bbc9624cb025178dfbcd591a48\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_b441fa888b783a5f87b9bf0c356\` FOREIGN KEY (\`firstAidId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_e5b6a3f67f026ba680ec7934d9e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_bfe711405403ccec6e83109d5be\` FOREIGN KEY (\`serviceId\`) REFERENCES \`doctor_services\`(\`serviceId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_1a957dd108a1f8071f8c8444dc0\` FOREIGN KEY (\`consultationId\`) REFERENCES \`consultations\`(\`consultationId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_1a957dd108a1f8071f8c8444dc0\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_bfe711405403ccec6e83109d5be\``);
        await queryRunner.query(`ALTER TABLE \`consultations\` DROP FOREIGN KEY \`FK_e5b6a3f67f026ba680ec7934d9e\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_b441fa888b783a5f87b9bf0c356\``);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` DROP FOREIGN KEY \`FK_9bbc9624cb025178dfbcd591a48\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`blockchainId\` \`blockchainId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`blockchainTxHash\` \`blockchainTxHash\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`fileHash\` \`fileHash\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prescription\` CHANGE \`fileName\` \`fileName\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`consultationId\` \`consultationId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`raw_response\``);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD \`raw_response\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`val_id\` \`val_id\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_1a957dd108a1f8071f8c8444dc0\` FOREIGN KEY (\`consultationId\`) REFERENCES \`consultations\`(\`consultationId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`diagnosis\` \`diagnosis\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`requestedDurationHours\` \`requestedDurationHours\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`endTime\` \`endTime\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`serviceId\` \`serviceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`consultations\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_bfe711405403ccec6e83109d5be\` FOREIGN KEY (\`serviceId\`) REFERENCES \`doctor_services\`(\`serviceId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`consultations\` ADD CONSTRAINT \`FK_e5b6a3f67f026ba680ec7934d9e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`bio\` \`bio\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(20) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`qualifications\` \`qualifications\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`doctors\` CHANGE \`specialization\` \`specialization\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`socialAuthId\` \`socialAuthId\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userRegistrationType\` \`userRegistrationType\` enum ('Google') NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userPassword\` \`userPassword\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`userEmail\` \`userEmail\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidId\` \`firstAidId\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`userUserId\` \`userUserId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`hospitalLookupNeeded\` \`hospitalLookupNeeded\` tinyint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`firstAidString\` \`firstAidString\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`triageLevel\` \`triageLevel\` enum ('HIGH', 'MEDIUM', 'LOW') NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` CHANGE \`text\` \`text\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_b441fa888b783a5f87b9bf0c356\` FOREIGN KEY (\`firstAidId\`) REFERENCES \`first_aid_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`prompt_entity\` ADD CONSTRAINT \`FK_9bbc9624cb025178dfbcd591a48\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`doctorImageUrl\``);
    }

}
