var httpProvider = require('./providers').HttpProvider,
    eth = require('./eth'),
    net = require('./net');
var utils = require('web3-utils');

function Web3(provider){

    this.connected = false;

    if(!provider){

        throw new Error('No provider provided');

    }

    this.connected = true;

    this.utils = utils;
    this.eth = eth;
    this.net = net;

    return this;

}

Web3.prototype.isConnected = function(){

    return this.connected;

};

Web3.prototype.isAddress = function(){

    return true;

};

Web3.providers = {
    HttpProvider : httpProvider
};



module.exports = Web3;
