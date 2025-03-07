import EthereumProof from '../src/EthereumProof';
import * as rlp from 'rlp';
import { BaseTrie as Trie } from 'merkle-patricia-tree'
let Web3 = require('./web3mock');
const keccak256 = require('keccak256');
const testTxData = require('./json/tx.json');
const testBlockData = require('./json/block.json');
const testReceiptData = require('./json/receipt.json');
//const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3Real = require('web3');

let ethereumProof: EthereumProof;

beforeAll(async () => {
    let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    ethereumProof = new EthereumProof(web3);
});

test('bigNumberToHex', () => {
  const result = ethereumProof.bigNumberToHex("2598935466852470157");
  expect(result).toStrictEqual("241146098fe7cd8d");
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

test('toRlpEncodableObject tx', () => {

  const tx = testTxData[4];
  const expected = {
    blockHash: '0xfc152bdc0705f622f33b41d50f8187fa2e6f1c1843605883242cae299bba5bb4',
    blockNumber: '0x63b664',
    from: '0xE76A78750C54457096C874f4b9B1562d26d424f5',
    gas: '0x5208',
    gasPrice: '0x59682f00',
    hash: '0xb13414644eeccf51554fa19a9db7cea3ff6252ba8de4a05701fcc864910acd1d',
    input: '0x',
    nonce: '0x01',
    r: '0x2811f2f66a542af98732525482283b0b70ee3740fb649a861d234a93932ca412',
    s: '0x3ab73221eaea609839985e44764e00d2c797848a413f2a9564f39a41a820f822',
    to: '0xA5F8A530cf6C614540Fbf9FFc742a0DF9C6a8645',
    transactionIndex: "0x72",
    type: '0x',
    v: '0x2e',
    value: '0x241146098fe7cd8d'
  }
  const result = ethereumProof.toRlpEncodableObject(tx);
  expect(result).toStrictEqual(expected);
});



test('composeTx', async () => {
  const expectedRawTx =   {
    chainId: '0x05',
    nonce: '0x01c6',
    maxPriorityFeePerGas: '0x59682f00',
    maxFeePerGas: '0x59682f09',
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
  web3.eth.txs = testTxData;
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
    "0x0" + testBlockData[0].difficulty.toString(16),
    "0x" + testBlockData[0].number.toString(16),
    "0x0" + testBlockData[0].gasLimit.toString(16),
    "0x" + testBlockData[0].gasUsed.toString(16),
    "0x" + testBlockData[0].timestamp.toString(16),
    testBlockData[0].extraData,
    testBlockData[0].mixHash,
    testBlockData[0].nonce,
    "0x0" + testBlockData[0].baseFeePerGas.toString(16)
  ];

  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
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

test('composeEvidence', async () => {

  const txhash = '0x4919ed7634998eb15e8860f899c6bb8b933b35919ba70e1ede509c3eecec2eb2';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, false);
  expect("0x" + keccak256(result.transaction).toString('hex')).toBe(txhash);
  const blockNumber = 5990997;
  expect(result.blockNumber).toBe(blockNumber);
  expect(result.blockHash).toBe("0xd0c07346e4042ad2ce354f6ca9bc90f5814540cd749fd4770677751d92672254");
});

test('composeEvidence full', async () => {

  const txhash = '0x2ebb8db9c2f02b32e707cf5cbe0408297d8a14c4390e94a89c7d93cb41f7177f';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  expect("0x" + keccak256(result.transaction).toString('hex')).toBe(txhash);
  const blockNumber = testBlockData[1].number
  expect(result.blockNumber).toBe(blockNumber);
  expect(result.blockHash).toBe(testBlockData[1].hash);
  const txProofBuffer = result.txProof.map((x) => {return Buffer.from(x.slice(2), 'hex');});
  const indexString = result.path.join("");
  const txFromProof = await Trie.verifyProof(Buffer.from(testBlockData[1].transactionsRoot.slice(2), 'hex'), Buffer.from(indexString, 'hex'), txProofBuffer) as Buffer;
  expect("0x" + txFromProof.toString('hex')).toBe(result.transaction);
  const expectedRawTx =   [
    '0x05',
    '0x40',
    '0x59682f00',
    '0x59682f09',
    '0x16e360',
    '0xE29d3d4d72997b31Ccdf8188113c189f1106f6b8',
    '0x',
    '0x2e1a7d4d000000000000000000000000000000000000000000000003c7ff28c778f23fc3',
    [],
    '0x01',
    '0xd3651e90dfc6f9878f6d0e6eb4de71f97678268df67749d9f278f2ef02791658',
    '0x6cbdf3aa331e2eb6649b6aebad86dd7a92e2013b6099bc6cadf47dab33c8cf79'
  ] 
  expect(result.rawTx).toStrictEqual(expectedRawTx);

  const expectedRawBlockHeader =   [
    '0xa0382bf860624356bb60e4ca63bb3c30c52317a1b1b323c7135772e0973d1f39',
    '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    '0x0000000000000000000000000000000000000000',
    '0x33b81395d533b7a0d6676d4930b0bdbf3de7540e6eae33339bec58654e6dba14',
    '0xe21ae8e5b2ae0139ce2c9705aa1db591b8234ec80a1b3be1a57d595fc131365c',
    '0xbc17ad31b138451a8687b36547e5c6992b01d2c076101a631052e28a68015d8f',
    '0x00000040000002000001024000040000002020000000000000000000800008000000080000020000000000000000000000000000020000000000004100200000000000000001000080000008100000000000008000000000000002000200000800001000020060000000010100000800000000000000000414001010020000000000008000000000002100004000010000100420028000000000000000011000020012000000000000200000000080800000000000800080008020000000402040004002080000080000000000000000400000000000000000000000000020020010000001000000800000000000000001000200000400000040000000000000',
    '0x02',
    '0x63b38a',
    '0x01c9c380',
    '0x099d0b',
    '0x622edbe7',
    '0x0000000000000000000000000000000000000000000000000000000000000000ae32f1f236f9b229a459e84e6152b50709d3c7aa85dab8eb4828a643b2ce8f9d7cb68a86f861a0b3c25672c2ddf620ea24e65cae6894f90e44936a5c60d1a49700',
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x0000000000000000',
    '0x07',
  ]
  expect(result.rawBlockHeader).toStrictEqual(expectedRawBlockHeader);
});

test('composeTx contractCreation', async () => {
  const txhash = '0x4a0c6a5cd5f927974943f0f18ea99b35a2f628ef06b42b6b75bdf75df8e5f138';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test('composeTx accessList', async () => {
  const txhash = '0x5ccff4e349d69a480b80594940984053ff4a57f5216fe1a5c001a2237e69b955';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test('composeBlockHeader EIP4895', async () => {
  const blockHeader = '0xe2f18d088596647916c58e828580822f84287d282ee8575843824a690969f01b';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(8663139);
  expect("0x" + keccak256(result.header).toString('hex')).toBe(blockHeader);
});

/*test('composeTx EIP4844', async () => {
  const txHash = '0x6e3bf401a2a8d217088baac236a2d936fca63a4bf1335cbb58cf6428a8ddbe1b';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(8663139);
  expect("0x" + keccak256(result.header).toString('hex')).toBe(blockHeader);
});*/

test('composeTx EIP4844', async () => {
  const txhash = '0xd0f1d4fd2f7d8d4f45e684fa4781e014b46187ea610239cbb6dcacbd342aa541';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test('composeTx EIP4844 type3', async () => {
  const txhash = '0x90eca9de964a301669e0286da2603762f549b569e4b00a933e2f0c0915799949';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test("composeBlockHeader Dencun", async () => {
  const blockHeader = '0xb92ffc3b0f42953f3b1567336dd16a519f12eaea436446c04178ab13b22feb6a';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(5236821);
  console.log(result)
  expect("0x" + keccak256(result.header).toString('hex')).toBe(blockHeader);
});

test("composeBlockHeader Dencun2", async () => {
  const blockHeader = '0x93aa6af9a6ffeab3d31bee86afcf7bda03c010201377ea0b1fdc9ae515ede028';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(5237179);
  console.log(result)
  expect("0x" + keccak256(result.header).toString('hex')).toBe(blockHeader);
});

test('composeTx dencun', async () => {
  const txhash = '0x38e10380df2c44af76e6edfa63e13c27544ffb0538c86804ada61be4e5f25d55';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.txs = testTxData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test("composeBlockHeader EIP7685 temporarily", async () => {
  const blockHeader = '0x59976d7dedf0eab9ee3d421c8aa8c60494c7dbbc00cde88fb643dec488a95b0c';
  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.blocks = testBlockData;
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeBlockHeader(5237180);
  console.log(result.rawHeader)
  expect(result.rawHeader[result.rawHeader.length - 1]).toBe("0x5dde95e71646a56cc424cbd12908ca08a3d0f22eeeb9338058f43376a1f14460");
  expect("0x" + keccak256(result.header).toString('hex')).not.toBe(blockHeader);
});


/*test('composeEvidence before dencun', async () => {

  const txhash = '0x2e572de79937801f88e493b805e285a30a0348f174a915f32289c4ce96ecf881';
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  expect("0x" + keccak256(result.transaction).toString('hex')).toBe(txhash);
  const txProofBuffer = result.txProof.map((x) => {return Buffer.from(x.slice(2), 'hex');});
  const indexString = result.path.join("");
  const txRoot = "0x476b9c9e4a6911d72c5ffcaded127f0646ff99848807a577ef5b6a88e6bd01f5"
  const txFromProof = await Trie.verifyProof(Buffer.from(txRoot.slice(2), 'hex'), Buffer.from(indexString, 'hex'), txProofBuffer) as Buffer;
  expect("0x" + txFromProof.toString('hex')).toBe(result.transaction);
}, 300000);*/

/*test('composeEvidence dencun', async () => {

  const txhash = '0x5025d018eb42a4e52d7497a84204ea675d00cf94d3ba37a4fe4d8693fa07666c';
  //let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  expect("0x" + keccak256(result.transaction).toString('hex')).toBe(txhash);
  const txProofBuffer = result.txProof.map((x) => {return Buffer.from(x.slice(2), 'hex');});
  const indexString = result.path.join("");
  const txRoot = "0x299c3f64b29bfbe90d80355862dcdd5cb9e98f073396406e92ad9f90b1af6f55"
  const txFromProof = await Trie.verifyProof(Buffer.from(txRoot.slice(2), 'hex'), Buffer.from(indexString, 'hex'), txProofBuffer) as Buffer;
  expect("0x" + txFromProof.toString('hex')).toBe(result.transaction);
}, 300000);*/

/*test('composeTx type3', async () => {
  const txhash = '0xe70153415ad0014467858da4c1bfe8987c18ee74c616024aebe92dff859c2e05';
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  console.log(result)
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});

test('composeTx type0', async () => {
  const txhash = '0x1ec322864d499adf5b6f1e27d9ef0a0c8be87a1dc89f88c33480aad26f227bbb';
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeTx(txhash);
  console.log(result)
  expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
});*/

/*test('composeEvidence type0', async () => {
  const txhash = '0x1ec322864d499adf5b6f1e27d9ef0a0c8be87a1dc89f88c33480aad26f227bbb';
  //let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://eth-sepolia-public.unifra.io'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  //expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
}, 300000);*/

/*test('composeEvidence type3', async () => {
  const txhash = '0xe70153415ad0014467858da4c1bfe8987c18ee74c616024aebe92dff859c2e05';
  //let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://eth-sepolia-public.unifra.io'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  //expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
}, 300000);*/

/*test('composeEvidence short r', async () => {
  const txhash = '0xb99e2d460b33784a75b125b1ce96eb14d577894d84ca217486565fc755fb2e8a';
  //let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://rpc.sepolia.org'))
  let web3 = new Web3Real(new Web3Real.providers.HttpProvider('https://eth-sepolia-public.unifra.io'))
  ethereumProof = new EthereumProof(web3);
  const result = await ethereumProof.composeEvidence(txhash, true);
  console.log(result)
  //expect("0x" + keccak256(result.tx).toString('hex')).toBe(txhash);
}, 300000);*/


//type3
//0xe70153415ad0014467858da4c1bfe8987c18ee74c616024aebe92dff859c2e05
//
//type0
//0x1ec322864d499adf5b6f1e27d9ef0a0c8be87a1dc89f88c33480aad26f227bbb

