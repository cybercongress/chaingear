const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');


const MNEMONIC = 'hockey wrong chase parade similar borrow laugh task miss magic tumble crack';

module.exports = {
    
    solc: {
        optimizer: {
          enabled: false,
          runs: 200
        }
    },
    
    mocha: {
        reporter: 'eth-gas-reporter',
            reporterOptions : {
            currency: 'USD',
            gasPrice: 21
        }
    },

    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        // development: {
        //   host: "localhost",
        //   port: 8545,
        //   network_id: "*" // Match any network id
        // },

        kovan: {
          // provider() {
          //   return new HDWalletProvider(MNEMONIC, 'https://kovan.infura.io/');
          // },
           host: "localhost",
           port: 8545,
           from: '0xf2492533F7d89DBfEd69757156c4B746839E59E8',

          network_id: 42,
          gasPrice: toWei(10, 'gwei').toNumber(),
          gas: toWei(7.3, 'mwei').toNumber(),
        },

        // live: {
        //   host: "localhost",
        //   port: 8545,
        //   network_id: 1,
        //   gasPrice: 10000000000,
        //   from: "0x00b2266565a2dF4dF0Dd473281b7bB88A86b27dd"
        // },

        development: {
          host: "127.0.0.1",
          port: 7545,
          network_id: "*",
          gas: 20000000,
          gasPrice: 100000000
        }
    }
};
