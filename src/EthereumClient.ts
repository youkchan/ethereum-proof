import BN from 'bn.js';

export enum EthereumClientKind {
  Web3 = 'web3',
  Ethers = 'ethers',
}

export type EthereumClientKindInput = EthereumClientKind | 'web3' | 'ethers' | undefined;

export interface EthereumClientAdapter {
  getTransaction(txHash: string): Promise<any>;
  getTransactionReceipt(txHash: string): Promise<any>;
  getBlock(blockNumber: number): Promise<any>;
  toHex(value: any): string;
}

export interface EthereumClientDetectionResult {
  adapter: EthereumClientAdapter;
  kind: EthereumClientKind;
}

function normalizeKind(kind?: EthereumClientKindInput): EthereumClientKind | undefined {
  if (kind === undefined) {
    return undefined;
  }
  if (typeof kind === 'string') {
    const normalized = kind.toLowerCase();
    if (normalized === EthereumClientKind.Web3) {
      return EthereumClientKind.Web3;
    }
    if (normalized === EthereumClientKind.Ethers) {
      return EthereumClientKind.Ethers;
    }
    throw new Error(`不明な Ethereum クライアント種別です: ${kind}`);
  }
  if (kind === EthereumClientKind.Web3 || kind === EthereumClientKind.Ethers) {
    return kind;
  }
  throw new Error(`不明な Ethereum クライアント種別です: ${String(kind)}`);
}

function detectKind(provider: any): EthereumClientKind {
  if (provider && provider.eth && typeof provider.eth.getTransaction === 'function') {
    return EthereumClientKind.Web3;
  }
  if (
    provider &&
    typeof provider.getTransaction === 'function' &&
    typeof provider.getBlock === 'function' &&
    (provider._isProvider === true || typeof provider.send === 'function')
  ) {
    return EthereumClientKind.Ethers;
  }
  throw new Error('サポートされていないプロバイダです。EthereumClientKind を明示指定してください。');
}

function toDecimalString(value: any): any {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (BN.isBN(value)) {
    return (value as BN).toString(10);
  }
  if (value._isBigNumber && typeof value.toString === 'function') {
    return value.toString();
  }
  if (typeof value.toString === 'function') {
    return value.toString();
  }
  return value;
}

function ensure0x(hex: string): string {
  return hex.startsWith('0x') || hex.startsWith('0X') ? `0x${hex.slice(2).toLowerCase()}` : `0x${hex.toLowerCase()}`;
}

function toEvenHex(hex: string): string {
  const normalized = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  if (normalized === '') {
    return '0x';
  }
  if (normalized.length === 1) {
    return `0x${normalized}`;
  }
  const padded = normalized.length % 2 === 0 ? normalized : `0${normalized}`;
  return `0x${padded}`;
}

function toNumberHex(num: number): string {
  if (num === 0) {
    return '0x';
  }
  return toEvenHex(num.toString(16));
}

function normalizeTxType(type: any): string | undefined {
  if (type === undefined || type === null) {
    return undefined;
  }
  if (typeof type === 'string') {
    if (type === '0x' || type === '0x0' || type === '0') {
      return '0x';
    }
    if (type.startsWith('0x') || type.startsWith('0X')) {
      const normalized = type.toLowerCase();
      return normalized === '0x00' ? '0x' : toEvenHex(normalized);
    }
    const numeric = Number(type);
    if (!Number.isNaN(numeric)) {
      return normalizeTxType(numeric);
    }
    return type;
  }
  if (typeof type === 'number') {
    if (type === 0) {
      return '0x';
    }
    return toNumberHex(type);
  }
  if (typeof type === 'bigint') {
    const numeric = Number(type);
    if (!Number.isNaN(numeric)) {
      return normalizeTxType(numeric);
    }
    return toEvenHex(type.toString(16));
  }
  if (type && type._isBigNumber && typeof type.toNumber === 'function') {
    const numeric = type.toNumber();
    return normalizeTxType(numeric);
  }
  return undefined;
}

function normalizeAccessList(accessList: any): any {
  if (!Array.isArray(accessList)) {
    return accessList ?? [];
  }
  return accessList.map((item) => ({
    address: item.address,
    storageKeys: Array.isArray(item.storageKeys) ? item.storageKeys.slice() : [],
  }));
}

function normalizeTransactionResponse(tx: any): any {
  if (!tx) {
    return tx;
  }
  return {
    hash: tx.hash,
    blockHash: tx.blockHash ?? null,
    blockNumber: tx.blockNumber !== undefined && tx.blockNumber !== null ? toDecimalString(tx.blockNumber) : tx.blockNumber,
    transactionIndex:
      tx.transactionIndex !== undefined && tx.transactionIndex !== null
        ? toDecimalString(tx.transactionIndex)
        : tx.transactionIndex,
    from: tx.from,
    to: tx.to ?? null,
    nonce: toDecimalString(tx.nonce),
    gas: toDecimalString(tx.gasLimit ?? tx.gas),
    gasPrice: tx.gasPrice !== undefined && tx.gasPrice !== null ? toDecimalString(tx.gasPrice) : tx.gasPrice,
    maxFeePerGas:
      tx.maxFeePerGas !== undefined && tx.maxFeePerGas !== null ? toDecimalString(tx.maxFeePerGas) : tx.maxFeePerGas,
    maxPriorityFeePerGas:
      tx.maxPriorityFeePerGas !== undefined && tx.maxPriorityFeePerGas !== null
        ? toDecimalString(tx.maxPriorityFeePerGas)
        : tx.maxPriorityFeePerGas,
    maxFeePerBlobGas:
      tx.maxFeePerBlobGas !== undefined && tx.maxFeePerBlobGas !== null
        ? toDecimalString(tx.maxFeePerBlobGas)
        : tx.maxFeePerBlobGas,
    blobVersionedHashes: tx.blobVersionedHashes ?? [],
    chainId: tx.chainId !== undefined && tx.chainId !== null ? toDecimalString(tx.chainId) : tx.chainId,
    value: tx.value !== undefined && tx.value !== null ? toDecimalString(tx.value) : tx.value ?? '0',
    data: tx.data ?? tx.input ?? '0x',
    input: tx.input ?? tx.data ?? '0x',
    accessList: normalizeAccessList(tx.accessList),
    v: tx.v !== undefined && tx.v !== null ? toDecimalString(tx.v) : tx.v,
    r: tx.r ?? '0x',
    s: tx.s ?? '0x',
    yParity: tx.yParity ?? tx.v,
    type: normalizeTxType(tx.type),
  };
}

function normalizeReceiptResponse(receipt: any): any {
  if (!receipt) {
    return receipt;
  }
  const normalized: any = {
    ...receipt,
    blockNumber:
      receipt.blockNumber !== undefined && receipt.blockNumber !== null
        ? toDecimalString(receipt.blockNumber)
        : receipt.blockNumber,
    transactionIndex:
      receipt.transactionIndex !== undefined && receipt.transactionIndex !== null
        ? toDecimalString(receipt.transactionIndex)
        : receipt.transactionIndex,
    cumulativeGasUsed:
      receipt.cumulativeGasUsed !== undefined && receipt.cumulativeGasUsed !== null
        ? toDecimalString(receipt.cumulativeGasUsed)
        : receipt.cumulativeGasUsed,
    gasUsed:
      receipt.gasUsed !== undefined && receipt.gasUsed !== null ? toDecimalString(receipt.gasUsed) : receipt.gasUsed,
    effectiveGasPrice:
      receipt.effectiveGasPrice !== undefined && receipt.effectiveGasPrice !== null
        ? toDecimalString(receipt.effectiveGasPrice)
        : receipt.effectiveGasPrice,
    status:
      typeof receipt.status === 'boolean'
        ? receipt.status
        : receipt.status === undefined || receipt.status === null
        ? receipt.status
        : Number(receipt.status) === 1,
    type: normalizeTxType(receipt.type),
  };
  if (Array.isArray(receipt.logs)) {
    normalized.logs = receipt.logs.map((log: any) => ({
      ...log,
      blockNumber:
        log.blockNumber !== undefined && log.blockNumber !== null ? toDecimalString(log.blockNumber) : log.blockNumber,
      transactionIndex:
        log.transactionIndex !== undefined && log.transactionIndex !== null
          ? toDecimalString(log.transactionIndex)
          : log.transactionIndex,
      logIndex:
        log.logIndex !== undefined && log.logIndex !== null ? toDecimalString(log.logIndex) : log.logIndex,
    }));
  }
  return normalized;
}

function normalizeBlockResponse(block: any): any {
  if (!block) {
    return block;
  }
  const normalized: any = {
    ...block,
    number: block.number !== undefined && block.number !== null ? toDecimalString(block.number) : block.number,
    gasLimit:
      block.gasLimit !== undefined && block.gasLimit !== null ? toDecimalString(block.gasLimit) : block.gasLimit,
    gasUsed: block.gasUsed !== undefined && block.gasUsed !== null ? toDecimalString(block.gasUsed) : block.gasUsed,
    timestamp:
      block.timestamp !== undefined && block.timestamp !== null ? toDecimalString(block.timestamp) : block.timestamp,
    difficulty:
      block.difficulty !== undefined && block.difficulty !== null ? toDecimalString(block.difficulty) : block.difficulty,
    baseFeePerGas:
      block.baseFeePerGas !== undefined && block.baseFeePerGas !== null
        ? toDecimalString(block.baseFeePerGas)
        : block.baseFeePerGas,
    blobGasUsed:
      block.blobGasUsed !== undefined && block.blobGasUsed !== null
        ? toDecimalString(block.blobGasUsed)
        : block.blobGasUsed,
    excessBlobGas:
      block.excessBlobGas !== undefined && block.excessBlobGas !== null
        ? toDecimalString(block.excessBlobGas)
        : block.excessBlobGas,
  };
  if (Array.isArray(normalized.transactions) && normalized.transactions.length > 0) {
    const first = normalized.transactions[0];
    if (typeof first === 'object' && first !== null) {
      normalized.transactions = normalized.transactions.map((tx: any) => tx.hash);
    }
  }
  return normalized;
}

function toHexString(value: any): string {
  if (value === undefined || value === null) {
    return '0x';
  }
  if (typeof value === 'string') {
    if (value === '') {
      return '0x';
    }
    if (value.startsWith('0x') || value.startsWith('0X')) {
      return ensure0x(value);
    }
    if (!Number.isNaN(Number(value))) {
      const bn = new BN(value, 10);
      return `0x${bn.toString(16) || '0'}`;
    }
    return value;
  }
  if (typeof value === 'number') {
    if (value === 0) {
      return '0x0';
    }
    return `0x${value.toString(16)}`;
  }
  if (typeof value === 'bigint') {
    if (value === BigInt(0)) {
      return '0x0';
    }
    return `0x${value.toString(16)}`;
  }
  if (BN.isBN(value)) {
    const bn = value as BN;
    return `0x${bn.toString(16) || '0'}`;
  }
  if (value._isBigNumber && typeof value.toHexString === 'function') {
    return ensure0x(value.toHexString());
  }
  if (typeof value.toString === 'function') {
    const str = value.toString();
    if (!Number.isNaN(Number(str))) {
      const bn = new BN(str, 10);
      return `0x${bn.toString(16) || '0'}`;
    }
  }
  const bn = new BN(String(value));
  return `0x${bn.toString(16) || '0'}`;
}

class Web3ClientAdapter implements EthereumClientAdapter {
  constructor(private readonly provider: any) {}

  async getTransaction(txHash: string): Promise<any> {
    return this.provider.eth.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return this.provider.eth.getTransactionReceipt(txHash);
  }

  async getBlock(blockNumber: number): Promise<any> {
    return this.provider.eth.getBlock(blockNumber);
  }

  toHex(value: any): string {
    return this.provider.utils.toHex(value);
  }
}

class EthersClientAdapter implements EthereumClientAdapter {
  constructor(private readonly provider: any) {}

  async getTransaction(txHash: string): Promise<any> {
    const tx = await this.provider.getTransaction(txHash);
    return normalizeTransactionResponse(tx);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    const receipt = await this.provider.getTransactionReceipt(txHash);
    return normalizeReceiptResponse(receipt);
  }

  async getBlock(blockNumber: number): Promise<any> {
    const block = await this.provider.getBlock(blockNumber);
    return normalizeBlockResponse(block);
  }

  toHex(value: any): string {
    return toHexString(value);
  }
}

export function createEthereumClientAdapter(
  provider: any,
  kindInput?: EthereumClientKindInput
): EthereumClientDetectionResult {
  const normalizedKind = normalizeKind(kindInput);
  const kind = normalizedKind ?? detectKind(provider);
  if (kind === EthereumClientKind.Web3) {
    return { adapter: new Web3ClientAdapter(provider), kind };
  }
  if (kind === EthereumClientKind.Ethers) {
    return { adapter: new EthersClientAdapter(provider), kind };
  }
  throw new Error(`未対応の Ethereum クライアント種別です: ${kind}`);
}
