var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "rlp", "merkle-patricia-tree"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //import Web3Service from './Web3Service'
    var rlp = __importStar(require("rlp"));
    var merkle_patricia_tree_1 = require("merkle-patricia-tree");
    var EthereumProof = /** @class */ (function () {
        function EthereumProof(web3) {
            this.web3 = web3;
        }
        EthereumProof.prototype.intToHex = function (_integer) {
            if (_integer < 0) {
                throw new Error('Invalid integer as argument, must be unsigned!');
            }
            var hex = _integer.toString(16);
            return hex.length % 2 ? "0".concat(hex) : hex;
        };
        EthereumProof.prototype.toRlpEncodableObject = function (_object) {
            var _this = this;
            var result = Object.fromEntries(Object.entries(_object)
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                if (value instanceof Array) {
                    return [key, value];
                }
                var param = String(value);
                if (param.indexOf('0x') === 0) {
                    if (param == "0x0") {
                        param = "0x";
                    }
                    else if (param.length % 2 == 1) {
                        param = "0x0" + param.slice(2);
                    }
                    return [key, param];
                }
                else if (!Number.isNaN(parseInt(param))) {
                    var hex = String(_this.intToHex(parseInt(param)));
                    return [key, hex == "00" ? "0x" : "0x" + hex];
                }
                return [key, value];
            }));
            return result;
        };
        EthereumProof.prototype.composeTx = function (_txHash) {
            return __awaiter(this, void 0, void 0, function () {
                var response, txData1, bufferTx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.web3.eth.getTransaction(_txHash)];
                        case 1:
                            response = _a.sent();
                            txData1 = {};
                            response = this.toRlpEncodableObject(response);
                            if (response.type != "0x" && response.type != undefined) {
                                txData1.chainId = response.chainId;
                            }
                            txData1.nonce = response.nonce;
                            if (response.type == "0x" || response.type == undefined) {
                                txData1.gasPrice = response.gasPrice;
                            }
                            else if (response.type == "0x01") {
                                txData1.gasPrice = response.gasPrice;
                            }
                            else {
                                txData1.maxPriorityFeePerGas = response.maxPriorityFeePerGas;
                                txData1.maxFeePerGas = response.maxFeePerGas;
                            }
                            txData1.gasLimit = response.gas;
                            txData1.to = response.to;
                            txData1.value = response.value;
                            txData1.data = response.input;
                            if (response.type != "0x" && response.type != undefined) {
                                txData1.accessList = response.accessList;
                            }
                            txData1.v = response.v;
                            txData1.r = response.r;
                            txData1.s = response.s;
                            bufferTx = rlp.encode(Object.values(txData1));
                            if (response.type != "0x" && response.type != undefined) {
                                bufferTx = Buffer.concat([Buffer.from(response.type.slice(2), 'hex'), bufferTx]);
                            }
                            return [2 /*return*/, { index: response.transactionIndex, tx: bufferTx, rawTx: txData1, txType: response.type }];
                    }
                });
            });
        };
        EthereumProof.prototype.composeTxReceipt = function (_txHash, _txType) {
            return __awaiter(this, void 0, void 0, function () {
                var response, logs, i, tmp, receipt, _a, bufferTxReceipt;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.web3.eth.getTransactionReceipt(_txHash)];
                        case 1:
                            response = _b.sent();
                            logs = [];
                            for (i = 0; i < response.logs.length; i++) {
                                tmp = [];
                                tmp.push(response.logs[i].address);
                                tmp.push(response.logs[i].topics);
                                tmp.push(response.logs[i].data);
                                logs.push(tmp);
                            }
                            _a = [response.status ? "0x01" : "0x"];
                            return [4 /*yield*/, this.web3.utils.toHex(response.cumulativeGasUsed)];
                        case 2:
                            receipt = _a.concat([
                                _b.sent(),
                                response.logsBloom,
                                logs
                            ]);
                            bufferTxReceipt = rlp.encode(receipt);
                            if (_txType != "0x" && _txType != undefined) {
                                bufferTxReceipt = Buffer.concat([Buffer.from(_txType.slice(2), 'hex'), bufferTxReceipt]);
                            }
                            return [2 /*return*/, { txReceipt: bufferTxReceipt, rawTxReceipt: receipt }];
                    }
                });
            });
        };
        EthereumProof.prototype.composeBlockHeader = function (_blockNumber) {
            return __awaiter(this, void 0, void 0, function () {
                var block, list, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.web3.eth.getBlock(_blockNumber)];
                        case 1:
                            block = _b.sent();
                            _a = [block.parentHash,
                                block.sha3Uncles,
                                block.miner,
                                block.stateRoot,
                                block.transactionsRoot,
                                block.receiptsRoot,
                                block.logsBloom];
                            return [4 /*yield*/, this.web3.utils.toHex(block.difficulty)];
                        case 2:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, this.web3.utils.toHex(block.number)];
                        case 3:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, this.web3.utils.toHex(block.gasLimit)];
                        case 4:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, this.web3.utils.toHex(block.gasUsed)];
                        case 5:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, this.web3.utils.toHex(block.timestamp)];
                        case 6:
                            list = _a.concat([
                                _b.sent(),
                                block.extraData,
                                block.mixHash,
                                block.nonce,
                                block.baseFeePerGas
                            ]);
                            return [2 /*return*/, { header: rlp.encode(list), rawHeader: list }];
                    }
                });
            });
        };
        EthereumProof.prototype.composeEvidence = function (_changerTxHash) {
            return __awaiter(this, void 0, void 0, function () {
                var response, changerTx, isEther, encodedTxReceipt, changerTxReceipt, block, txs, txTrie, txReceiptTrie, i, composedTx, key, composedTxReceipt, changerTxIndex, proof, stringProofArray, encodedTx, txInput, txInputStart, txInputEnd, stringReceiptProofArray, receiptProof, index, path;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log("Start Compose Evidence");
                            return [4 /*yield*/, this.web3.eth.getTransaction(_changerTxHash)];
                        case 1:
                            response = _b.sent();
                            return [4 /*yield*/, this.composeTx(_changerTxHash)];
                        case 2:
                            changerTx = _b.sent();
                            isEther = response.value !== "0" ? true : false;
                            encodedTxReceipt = "0x";
                            if (!!isEther) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.composeTxReceipt(_changerTxHash, changerTx.txType)];
                        case 3:
                            changerTxReceipt = _b.sent();
                            encodedTxReceipt = "0x" + changerTxReceipt.txReceipt.toString('hex');
                            _b.label = 4;
                        case 4: return [4 /*yield*/, this.web3.eth.getBlock(response.blockNumber)];
                        case 5:
                            block = _b.sent();
                            txs = block.transactions;
                            txTrie = new merkle_patricia_tree_1.BaseTrie();
                            txReceiptTrie = new merkle_patricia_tree_1.BaseTrie();
                            i = 0;
                            _b.label = 6;
                        case 6:
                            if (!(i < txs.length)) return [3 /*break*/, 12];
                            return [4 /*yield*/, this.composeTx(txs[i])];
                        case 7:
                            composedTx = _b.sent();
                            key = rlp.encode(composedTx.index);
                            return [4 /*yield*/, txTrie.put(key, composedTx.tx)];
                        case 8:
                            _b.sent();
                            if (!!isEther) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.composeTxReceipt(txs[i], composedTx.txType)];
                        case 9:
                            composedTxReceipt = _b.sent();
                            return [4 /*yield*/, txReceiptTrie.put(key, composedTxReceipt.txReceipt)];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            i++;
                            return [3 /*break*/, 6];
                        case 12:
                            changerTxIndex = rlp.encode(changerTx.index);
                            return [4 /*yield*/, merkle_patricia_tree_1.BaseTrie.createProof(txTrie, changerTxIndex)];
                        case 13:
                            proof = _b.sent();
                            stringProofArray = proof.map(function (x) { return "0x" + x.toString('hex'); });
                            encodedTx = "0x" + changerTx.tx.toString('hex');
                            txInput = changerTx.rawTx.data.slice(2);
                            txInputStart = encodedTx.indexOf(txInput);
                            txInputEnd = txInputStart + txInput.length;
                            stringReceiptProofArray = [];
                            if (!!isEther) return [3 /*break*/, 15];
                            return [4 /*yield*/, merkle_patricia_tree_1.BaseTrie.createProof(txReceiptTrie, changerTxIndex)];
                        case 14:
                            receiptProof = _b.sent();
                            stringReceiptProofArray = receiptProof.map(function (x) { return "0x" + x.toString('hex'); });
                            _b.label = 15;
                        case 15:
                            index = changerTxIndex.toString('hex');
                            path = Array.prototype.map.call(index, function (x) {
                                return parseInt(x, 16);
                            });
                            console.log("End Compose Evidence Successfully");
                            _a = {};
                            return [4 /*yield*/, this.web3.utils.toHex(response.blockNumber)];
                        case 16: return [2 /*return*/, (_a.blockNumber = _b.sent(),
                                _a.blockHash = response.blockHash,
                                //blockHeader: encodedBlockHeader,
                                _a.txReceiptProof = stringReceiptProofArray,
                                _a.txProof = stringProofArray,
                                _a.transaction = encodedTx,
                                _a.txDataSpot = [txInputStart, txInputEnd],
                                _a.path = path,
                                _a.txReceipt = encodedTxReceipt,
                                _a)];
                    }
                });
            });
        };
        return EthereumProof;
    }());
    exports.default = EthereumProof;
});
