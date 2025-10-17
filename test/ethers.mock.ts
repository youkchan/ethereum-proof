import BN from 'bn.js';

type Primitive = string | number | boolean | null | undefined;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toBN(value: any): BN {
  if (value instanceof BN) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.toLowerCase();
    if (trimmed === '' || trimmed === '0x') {
      return new BN(0);
    }
    if (trimmed.startsWith('0x')) {
      const hex = trimmed.slice(2);
      return hex === '' ? new BN(0) : new BN(hex, 16);
    }
    return new BN(trimmed, 10);
  }
  if (typeof value === 'number') {
    return new BN(value);
  }
  if (typeof value === 'bigint') {
    return new BN(value.toString());
  }
  return new BN(String(value), 10);
}

function normalizeNumber(value: any): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    if (value === '') {
      return 0;
    }
    const trimmed = value.toLowerCase();
    if (trimmed === '0x' || trimmed === '0x0') {
      return 0;
    }
    if (trimmed.startsWith('0x')) {
      return parseInt(trimmed, 16);
    }
    return parseInt(trimmed, 10);
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (BN.isBN(value)) {
    return (value as BN).toNumber();
  }
  if (value._isBigNumber && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  if (typeof value.valueOf === 'function') {
    const numeric = value.valueOf() as Primitive;
    if (typeof numeric === 'number') {
      return numeric;
    }
  }
  const coerced = Number(value);
  return Number.isNaN(coerced) ? null : coerced;
}

class MockBigNumber {
  readonly _isBigNumber = true;
  private readonly value: BN;

  constructor(input: any) {
    this.value = toBN(input);
  }

  toHexString(): string {
    return `0x${this.value.toString(16) || '0'}`;
  }

  toString(base?: number): string {
    if (base !== undefined) {
      return this.value.toString(base);
    }
    return this.value.toString(10);
  }

  toNumber(): number {
    return this.value.toNumber();
  }

  valueOf(): string {
    return this.toString();
  }
}

function createBigNumber(value: any): MockBigNumber {
  return new MockBigNumber(value ?? 0);
}

function convertAccessList(accessList: any): Array<{ address: string; storageKeys: string[] }> {
  if (!Array.isArray(accessList)) {
    return [];
  }
  return accessList.map((item) => ({
    address: item.address,
    storageKeys: Array.isArray(item.storageKeys) ? item.storageKeys.slice() : [],
  }));
}

function convertTransaction(raw: any): any {
  if (!raw) {
    return null;
  }
  return {
    hash: raw.hash,
    blockHash: raw.blockHash ?? null,
    blockNumber: normalizeNumber(raw.blockNumber),
    transactionIndex:
      raw.transactionIndex !== undefined && raw.transactionIndex !== null
        ? normalizeNumber(raw.transactionIndex)
        : null,
    from: raw.from,
    to: raw.to ?? null,
    nonce: normalizeNumber(raw.nonce) ?? 0,
    gas: raw.gas ?? raw.gasLimit,
    gasLimit: createBigNumber(raw.gas ?? raw.gasLimit ?? 0),
    gasPrice: raw.gasPrice !== undefined ? createBigNumber(raw.gasPrice) : null,
    maxFeePerGas: raw.maxFeePerGas !== undefined ? createBigNumber(raw.maxFeePerGas) : null,
    maxPriorityFeePerGas:
      raw.maxPriorityFeePerGas !== undefined ? createBigNumber(raw.maxPriorityFeePerGas) : null,
    maxFeePerBlobGas: raw.maxFeePerBlobGas !== undefined ? createBigNumber(raw.maxFeePerBlobGas) : null,
    blobVersionedHashes: raw.blobVersionedHashes ? raw.blobVersionedHashes.slice() : undefined,
    data: raw.input ?? raw.data ?? '0x',
    input: raw.input ?? raw.data ?? '0x',
    value: createBigNumber(raw.value ?? 0),
    chainId: raw.chainId !== undefined && raw.chainId !== null ? normalizeNumber(raw.chainId) ?? null : null,
    type: raw.type !== undefined && raw.type !== null ? normalizeNumber(raw.type) ?? null : null,
    accessList: convertAccessList(raw.accessList),
    v: raw.v !== undefined && raw.v !== null ? normalizeNumber(raw.v) : null,
    r: raw.r ?? '0x',
    s: raw.s ?? '0x',
    yParity: raw.yParity !== undefined && raw.yParity !== null ? normalizeNumber(raw.yParity) ?? null : null,
    maxPriorityFeePerGasPerBlob: raw.maxPriorityFeePerGasPerBlob,
  };
}

function convertReceipt(raw: any): any {
  if (!raw) {
    return null;
  }
  return {
    to: raw.to,
    from: raw.from,
    contractAddress: raw.contractAddress ?? null,
    transactionHash: raw.transactionHash,
    blockHash: raw.blockHash,
    blockNumber: normalizeNumber(raw.blockNumber),
    transactionIndex:
      raw.transactionIndex !== undefined && raw.transactionIndex !== null
        ? normalizeNumber(raw.transactionIndex)
        : null,
    cumulativeGasUsed: createBigNumber(raw.cumulativeGasUsed ?? 0),
    gasUsed: createBigNumber(raw.gasUsed ?? 0),
    effectiveGasPrice: raw.effectiveGasPrice !== undefined ? createBigNumber(raw.effectiveGasPrice) : null,
    status: raw.status ? 1 : 0,
    logsBloom: raw.logsBloom,
    type: raw.type !== undefined && raw.type !== null ? normalizeNumber(raw.type) ?? null : null,
    logs: Array.isArray(raw.logs)
      ? raw.logs.map((log: any) => ({
          address: log.address,
          data: log.data,
          topics: Array.isArray(log.topics) ? log.topics.slice() : [],
          blockHash: log.blockHash ?? raw.blockHash,
          blockNumber: normalizeNumber(log.blockNumber ?? raw.blockNumber),
          transactionHash: log.transactionHash ?? raw.transactionHash,
          transactionIndex:
            log.transactionIndex !== undefined && log.transactionIndex !== null
              ? normalizeNumber(log.transactionIndex)
              : null,
          logIndex: log.logIndex !== undefined && log.logIndex !== null ? normalizeNumber(log.logIndex) : null,
          removed: Boolean(log.removed),
        }))
      : [],
  };
}

function convertBlock(raw: any): any {
  if (!raw) {
    return null;
  }
  return {
    hash: raw.hash,
    parentHash: raw.parentHash,
    number: normalizeNumber(raw.number),
    timestamp: normalizeNumber(raw.timestamp),
    nonce: raw.nonce,
    mixHash: raw.mixHash,
    difficulty: createBigNumber(raw.difficulty ?? 0),
    gasLimit: createBigNumber(raw.gasLimit ?? 0),
    gasUsed: createBigNumber(raw.gasUsed ?? 0),
    miner: raw.miner,
    extraData: raw.extraData,
    transactions: Array.isArray(raw.transactions) ? raw.transactions.slice() : [],
    sha3Uncles: raw.sha3Uncles,
    stateRoot: raw.stateRoot,
    transactionsRoot: raw.transactionsRoot,
    receiptsRoot: raw.receiptsRoot,
    logsBloom: raw.logsBloom,
    baseFeePerGas: raw.baseFeePerGas !== undefined ? createBigNumber(raw.baseFeePerGas) : null,
    blobGasUsed: raw.blobGasUsed !== undefined ? createBigNumber(raw.blobGasUsed) : null,
    excessBlobGas: raw.excessBlobGas !== undefined ? createBigNumber(raw.excessBlobGas) : null,
    parentBeaconBlockRoot: raw.parentBeaconBlockRoot,
    withdrawalsRoot: raw.withdrawalsRoot,
    requestsHash: raw.requestsHash,
  };
}

function matchBlockNumber(target: number | string | null, candidate: any): boolean {
  const candidateNumber = normalizeNumber(candidate);
  if (target === null) {
    return false;
  }
  if (typeof target === 'string') {
    if (target.toLowerCase() === 'latest') {
      return candidateNumber !== null;
    }
    const parsed = normalizeNumber(target);
    return parsed !== null && parsed === candidateNumber;
  }
  return candidateNumber === target;
}

export class MockEthersProvider {
  readonly _isProvider = true;
  private txs: any[] = [];
  private blocks: any[] = [];
  private receipts: any[] = [];

  constructor(initial?: { txs?: any[]; blocks?: any[]; receipts?: any[] }) {
    if (initial?.txs) {
      this.setTransactions(initial.txs);
    }
    if (initial?.blocks) {
      this.setBlocks(initial.blocks);
    }
    if (initial?.receipts) {
      this.setReceipts(initial.receipts);
    }
  }

  setTransactions(txs: any[]): void {
    this.txs = deepClone(txs);
  }

  setBlocks(blocks: any[]): void {
    this.blocks = deepClone(blocks);
  }

  setReceipts(receipts: any[]): void {
    this.receipts = deepClone(receipts);
  }

  async getTransaction(txHash: string): Promise<any> {
    const raw = this.txs.find((tx) => tx.hash === txHash);
    return convertTransaction(raw);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    const raw =
      this.receipts.find((receipt) => receipt.transactionHash === txHash) ??
      (this.receipts.length > 0 ? this.receipts[0] : undefined);
    return convertReceipt(raw);
  }

  async getBlock(blockNumber: number | string): Promise<any> {
    if (blockNumber === 'latest') {
      const latest = this.blocks[this.blocks.length - 1];
      return convertBlock(latest);
    }
    const normalizedTarget = normalizeNumber(blockNumber);
    const raw = this.blocks.find((block) => matchBlockNumber(normalizedTarget, block.number));
    return convertBlock(raw);
  }

  // Minimal send implementation for compatibility checks
  async send(): Promise<never> {
    throw new Error('send not implemented in MockEthersProvider');
  }
}
