const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');


const MNEMONIC = 'hockey wrong chase parade similar borrow laugh task miss magic tumble crack';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },

    kovan: {
      host: "localhost",
      port: 8545,
      network_id: 42,
      gasPrice: 1000000000,
      gas: 6721975,
      from: "0xa3564D084fabf13e69eca6F2949D3328BF6468Ef"
    },

    // kovan: {
    //   provider() {
    //     return new HDWalletProvider(MNEMONIC, 'https://kovan.infura.io/');
    //   },
    //   network_id: 42,
    //   gasPrice: toWei(4, 'gwei').toNumber(),
    //   gas: toWei(6.9, 'mwei').toNumber(),

    //   // gasPrice: 1000000000, //toWei(4, 'gwei').toNumber(),
    //   // gas: 7992189, //toWei(6.9, 'mwei').toNumber(),
    //   // from: "0xa3564D084fabf13e69eca6F2949D3328BF6468Ef",
    // },

    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gasPrice: 10000000000,
      from: "0x00b2266565a2dF4dF0Dd473281b7bB88A86b27dd"
    }
  }
};
