import EthereumProof from '../src/EthereumProof';
import * as rlp from 'rlp';
const Web3 = require('./web3mock');
const keccak256 = require('keccak256');
const testTxData = require('./json/tx.json');
const testBlockData = require('./json/block.json');
const testReceiptData = require('./json/receipt.json');

let ethereumProof: EthereumProof;

beforeAll(async () => {
    let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    ethereumProof = new EthereumProof(web3);
});

test('toRlpEncodableObject array', () => {
  const obj = {test: []}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(obj);
});

test('toRlpEncodableObject zeroHex', () => {
  const obj = {test: "0x0"}; 
  const expected = {test: "0x"}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(expected);
});

test('toRlpEncodableObject oddHex', () => {
  const obj = {test: "0x7"}; 
  const expected = {test: "0x07"}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(expected);
});

test('toRlpEncodableObject number', () => {
  const obj = {test: "10"}; 
  const expected = {test: "0x0a"}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(expected);
});

test('toRlpEncodableObject number 0', () => {
  const obj = {test: "0"}; 
  const expected = {test: "0x"}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(expected);
});

test('toRlpEncodableObject number 2digits', () => {
  const obj = {test: "17"}; 
  const expected = {test: "0x11"}; 
  const result = ethereumProof.toRlpEncodableObject(obj);
  expect(result).toStrictEqual(expected);
});

test('composeTx', async () => {
  const expectedRawTx =   {
    chainId: '0x05',
    nonce: '0x01c6',
    maxFeePerGas: '0x59682f09',
    maxPriorityFeePerGas: '0x59682f00',
    gasLimit: '0x5208',
    to: '0xe202b444db397f53ae05149fe2843d7841a2dcbe',
    value: '0x0de0b6b3a7640000',
    data: '0x',
    accessList: [],
    v: '0x',
    r: '0xd6ad37096fdb37dd4a1dbca37a05ad2ea31e426b0b31ab090a02fefe43c9142c',
    s: '0x22a65451089852be2e7ceddeb9c85f041003b6e3a37447a6097f1c88eedade87',
  };

  const txhash = '0x4919ed7634998eb15e8860f899c6bb8b933b35919ba70e1ede509c3eecec2eb2';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.tx = testTxData[0];
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
  expect(result.index).toBe("0x04");
  expect(result.rawTx).toStrictEqual(expectedRawTx);
  expect(result.txType).toBe("0x02");
});


test('composeBlockHeader', async () => {
  let expectedHash = "0xd0c07346e4042ad2ce354f6ca9bc90f5814540cd749fd4770677751d92672254";
  const expectedBlockHeader = [
    testBlockData[0].parentHash,
    testBlockData[0].sha3Uncles,
    testBlockData[0].miner,
    testBlockData[0].stateRoot,
    testBlockData[0].transactionsRoot,
    testBlockData[0].receiptsRoot,
    testBlockData[0].logsBloom,
    "0x" + testBlockData[0].difficulty.toString(16),
    "0x" + testBlockData[0].number.toString(16),
    "0x" + testBlockData[0].gasLimit.toString(16),
    "0x" + testBlockData[0].gasUsed.toString(16),
    "0x" + testBlockData[0].timestamp.toString(16),
    testBlockData[0].extraData,
    testBlockData[0].mixHash,
    testBlockData[0].nonce,
    testBlockData[0].baseFeePerGas
  ];

  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.block = testBlockData[0];
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(5990997);
  expect("0x" + keccak256(result.header).toString('hex')).toBe(expectedHash);
  expect(result.rawHeader).toStrictEqual(expectedBlockHeader);

});


test('composeTxReceipt', async () => {
  const txHash = "0xaaa6b88f3c88fef4d29d04dd5b7f67556af617c24f96f8d108a4ce05ca79760f";
  const expectedReceipt = [
    "0x01",
    "0x" + testReceiptData[0].cumulativeGasUsed.toString(16),
    testReceiptData[0].logsBloom,
    [
      [
        testReceiptData[0].logs[0].address,
        testReceiptData[0].logs[0].topics,
        testReceiptData[0].logs[0].data
      ]
    ]
  ];
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.receipt = testReceiptData[0];
  ethereumProof = new EthereumProof(web3);
  const txType = "0x02";
  const result = await ethereumProof.composeTxReceipt(txHash, txType);
  expect(result.rawTxReceipt).toStrictEqual(expectedReceipt);

  let bufferTxReceipt = rlp.encode(expectedReceipt);
  bufferTxReceipt = Buffer.concat([Buffer.from(txType.slice(2), 'hex'), bufferTxReceipt]);
  expect(result.txReceipt.toString('hex')).toBe(bufferTxReceipt.toString('hex'));

});
