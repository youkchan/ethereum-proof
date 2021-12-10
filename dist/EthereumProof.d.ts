/// <reference types="node" />
import Web3 from 'web3';
export default class EthereumProof {
    web3: Web3;
    constructor(web3: Web3);
    intToHex(_integer: number): string;
    toRlpEncodableObject(_object: any): any;
    composeTx(_txHash: string): Promise<{
        index: string;
        tx: Buffer;
        rawTx: any;
        txType: string;
    }>;
    composeTxReceipt(_txHash: string, _txType: string): Promise<{
        txReceipt: Buffer;
        rawTxReceipt: Array<any>;
    }>;
    composeBlockHeader(_blockNumber: number): Promise<{
        header: Buffer;
        rawHeader: any;
    }>;
    composeEvidence(_changerTxHash: string): Promise<{
        blockNumber: string;
        blockHash: string;
        txReceiptProof: Array<string>;
        txProof: Array<string>;
        transaction: string;
        txDataSpot: Array<number>;
        path: Array<any>;
        txReceipt: string;
    }>;
}
