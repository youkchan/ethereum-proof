//import Web3Service from './Web3Service'
import * as rlp from "rlp";
import { BaseTrie as Trie } from 'merkle-patricia-tree'
import Web3 from 'web3'

export default class EthereumProof {
//    web3 : Web3Service;
    web3 : Web3;
    constructor(web3 : Web3) {
        this.web3 = web3;
    }

    intToHex(_integer: number) : string{
        if (_integer < 0) {
            throw new Error('Invalid integer as argument, must be unsigned!');
        }
        const hex = _integer.toString(16);
        return hex.length % 2 ? `0${hex}` : hex;
    }

    toRlpEncodableObject(_object: any) : any{
      const result = Object.fromEntries(
        Object.entries(_object)
        .map(([ key, value ]) => {
          if(value instanceof Array){
            return [ key, value ];
          }
          let param = String(value);
          if(param.indexOf('0x') === 0) {
            if(param == "0x0" ){
              param = "0x"; 
            }else if(param.length % 2 == 1 ){
              param = "0x0" + param.slice(2);
            }
            return [ key, param ];
          } else if(!Number.isNaN(parseInt(param))){
            const hex =  String(this.intToHex(parseInt(param)));
            return [ key, hex == "00" ? "0x" : "0x" + hex];
          }
          return [ key, value ];
        })
      );
      return result;
    }

    async composeTx(_txHash: string) : Promise<{index: string, tx: Buffer, rawTx: any, txType: string}>{
      let response: any;
      response = await this.web3.eth.getTransaction(_txHash);
      const txData1: any = {};
      response = this.toRlpEncodableObject(response);
 
      if(response.type != "0x" && response.type != undefined) {
        txData1.chainId =  response.chainId;
      }
 
      txData1.nonce =  response.nonce;
 
      if(response.type == "0x" || response.type == undefined) {
        txData1.gasPrice = response.gasPrice;
      }
      else if(response.type == "0x01") {
        txData1.gasPrice = response.gasPrice;
      } else {
        txData1.maxPriorityFeePerGas = response.maxPriorityFeePerGas;
        txData1.maxFeePerGas =  response.maxFeePerGas;
      }
      txData1.gasLimit =  response.gas;
      txData1.to =  response.to;
      txData1.value =  response.value;
      txData1.data =  response.input;
 
      if(response.type != "0x" && response.type != undefined) {
          txData1.accessList=  response.accessList;
      }
 
      txData1.v = response.v;
      txData1.r = response.r;
      txData1.s = response.s;

      let bufferTx = rlp.encode(Object.values(txData1));
       if(response.type != "0x" && response.type != undefined) {
         bufferTx = Buffer.concat([Buffer.from(response.type.slice(2), 'hex'), bufferTx]);
       }

      return {index: response.transactionIndex, tx: bufferTx, rawTx: txData1, txType: response.type};

    }

    async composeTxReceipt(_txHash: string, _txType: string) : Promise<{txReceipt: Buffer, rawTxReceipt: Array<any>}>{
     const response = await this.web3.eth.getTransactionReceipt(_txHash);

     const logs : Array<any> = [];
     for(let i = 0; i < response.logs.length; i++) {
       const tmp : Array<any> = [];
       tmp.push(response.logs[i].address);
       tmp.push(response.logs[i].topics);
       tmp.push(response.logs[i].data);
       logs.push(tmp);
     }
     const receipt = [
       response.status ? "0x01" : "0x" ,
       await this.web3.utils.toHex(response.cumulativeGasUsed),
       response.logsBloom,
       logs,
     ]

     let bufferTxReceipt = rlp.encode(receipt);
      if(_txType != "0x" && _txType != undefined) {
        bufferTxReceipt = Buffer.concat([Buffer.from(_txType.slice(2), 'hex'), bufferTxReceipt]);
      }

      return {txReceipt: bufferTxReceipt, rawTxReceipt: receipt};

    }

    async composeBlockHeader(_blockNumber: number) : Promise<{header: Buffer, rawHeader: any}>{
      let block: any;
      block = await this.web3.eth.getBlock(_blockNumber);
      const list = [
        block.parentHash,
        block.sha3Uncles,
        block.miner,
        block.stateRoot,
        block.transactionsRoot,
        block.receiptsRoot,
        block.logsBloom,
        await this.web3.utils.toHex(block.difficulty),
        await this.web3.utils.toHex(block.number),
        await this.web3.utils.toHex(block.gasLimit),
        await this.web3.utils.toHex(block.gasUsed),
        await this.web3.utils.toHex(block.timestamp),
        block.extraData,
        block.mixHash,
        block.nonce,
        block.baseFeePerGas
      ];
      return {header: rlp.encode(list), rawHeader: list};

    }

    async composeEvidence(_changerTxHash: string)  : Promise<{blockNumber: string, blockHash: string, txReceiptProof: Array<string>, txProof: Array<string>, transaction: string, txDataSpot: Array<number>, path: Array<any>,txReceipt: string }>{

      console.log("Start Compose Evidence");
      let response: any;
      response = await this.web3.eth.getTransaction(_changerTxHash);
      const changerTx = await this.composeTx(_changerTxHash);
      const isEther = response.value !== "0" ? true : false;
      let encodedTxReceipt = "0x";
      if(!isEther) {
        const changerTxReceipt =await this.composeTxReceipt(_changerTxHash, changerTx.txType);
        encodedTxReceipt ="0x" + changerTxReceipt.txReceipt.toString('hex');
      }

      const block = await this.web3.eth.getBlock(response.blockNumber);
      //const composedBlockHeader = await this.composeBlockHeader(response.blockNumber);
      //const block = await web3.getBlock(5864245);
      const txs = block.transactions;
      const txTrie = new Trie()
      const txReceiptTrie = new Trie()
      for (let i = 0; i < txs.length; i++) {
        const composedTx = await this.composeTx(txs[i]);
        const key = rlp.encode(composedTx.index);
        await txTrie.put(key, composedTx.tx);
        if(!isEther) {
          const composedTxReceipt =await this.composeTxReceipt(txs[i], composedTx.txType);
          await txReceiptTrie.put(key, composedTxReceipt.txReceipt);
        }
      }

      const changerTxIndex = rlp.encode(changerTx.index);
      const proof = await Trie.createProof(txTrie, changerTxIndex);
      const stringProofArray = proof.map((x) => {return "0x" + x.toString('hex');});
      const encodedTx = "0x" + changerTx.tx.toString('hex');
      //const encodedBlockHeader = "0x" + composedBlockHeader.header.toString('hex');
      const txInput = changerTx.rawTx.data.slice(2);
      const txInputStart = encodedTx.indexOf(txInput);
      const txInputEnd = txInputStart + txInput.length;
      
      let stringReceiptProofArray: Array<string> = [];
      if(!isEther) {
        const receiptProof = await Trie.createProof(txReceiptTrie, changerTxIndex);
        stringReceiptProofArray = receiptProof.map((x) => {return "0x" + x.toString('hex');});
      }

      //let index = rlp.encode(Buffer.from(changerTxIndex.toString('hex'), 'hex')).toString('hex');
      const index = changerTxIndex.toString('hex');
      const path = Array.prototype.map.call(index, function(x) {
        return parseInt(x, 16);
      })

      console.log("End Compose Evidence Successfully");
      return {
        blockNumber: await this.web3.utils.toHex(response.blockNumber), 
        blockHash: response.blockHash,
        //blockHeader: encodedBlockHeader,
        txReceiptProof: stringReceiptProofArray, 
        txProof: stringProofArray,
        transaction: encodedTx, 
        txDataSpot: [txInputStart, txInputEnd], 
        path: path,
        txReceipt: encodedTxReceipt, 
      };
    }


}
