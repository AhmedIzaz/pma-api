import { MigrationInterface, QueryRunner } from "typeorm";

export class BlockchainFieldAdded1783352991478 implements MigrationInterface {
    name = 'BlockchainFieldAdded1783352991478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prescription\` ADD \`fileHash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` ADD \`blockchainTxHash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`prescription\` ADD \`blockchainId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP COLUMN \`blockchainId\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP COLUMN \`blockchainTxHash\``);
        await queryRunner.query(`ALTER TABLE \`prescription\` DROP COLUMN \`fileHash\``);
    }

}
