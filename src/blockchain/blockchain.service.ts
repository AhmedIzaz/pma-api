import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import DataStorageABI from './abi/DataStorage.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;

    constructor(private config: ConfigService) { }

    async onModuleInit() {
        const rpcUrl = this.config.get<string>('ALCHEMY_RPC_URL');
        const privateKey = this.config.get<string>('WALLET_PRIVATE_KEY');
        const contractAddress = this.config.get<string>('CONTRACT_ADDRESS');

        // Connect to Polygon Amoy via Alchemy
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        // Create a wallet signer (this is what signs transactions with your private key)
        this.wallet = new ethers.Wallet(privateKey as string, this.provider);
        console.log({ DataStorageABI })
        // Connect to your deployed smart contract
        this.contract = new ethers.Contract(
            contractAddress as string,
            DataStorageABI,
            this.wallet,
        );

        this.logger.log(`Blockchain service ready. Wallet: ${this.wallet.address}`);
    }

    /**
     * Stores a hash of the data on-chain.
     * We hash the data so we're not storing raw sensitive data on a public chain.
     */
    async storeDataOnChain(data: string): Promise<{
        txHash: string;
        blockchainId: number;
    }> {
        // Create a hash of the data (a fingerprint)
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(data));

        this.logger.log(`Sending transaction to blockchain...`);

        // Call the smart contract function — this costs gas (MATIC)
        const tx = await this.contract.storeData(dataHash);

        // Wait for the transaction to be mined (confirmed on-chain)
        const receipt = await tx.wait();

        // Parse the event log to get the blockchain record ID
        const event = receipt.logs
            .map((log) => {
                try {
                    return this.contract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find((e) => e?.name === 'DataStored');

        const blockchainId = event ? Number(event.args.id) : 0;

        this.logger.log(`Stored on-chain! TX: ${tx.hash}, ID: ${blockchainId}`);

        return {
            txHash: tx.hash,
            blockchainId,
        };
    }

    /** Read a record from the blockchain by its on-chain ID */
    async getRecordFromChain(id: number) {
        const result = await this.contract.getRecord(id);
        console.log({ result })
        return {
            id: Number(result[0]),
            dataHash: result[1],
            sender: result[2],
            timestamp: new Date(Number(result[3]) * 1000).toISOString(),
        };
    }

    verifyDataHash(data: string, onChainDataHash: string): boolean {
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(data));
        return dataHash === onChainDataHash;
    }
}