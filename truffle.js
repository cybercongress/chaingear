const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');


const MNEMONIC = 'hockey wrong chase parade similar borrow laugh task miss magic tumble crack';

module.exports = {
    
    solc: {
        optimizer: {
          enabled: true,
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

        kovan: {
          host: "localhost",
          port: 8545,
          from: '0xf2492533F7d89DBfEd69757156c4B746839E59E8',
          network_id: 42,
          gasPrice: toWei(10, 'gwei').toNumber(),
          gas: toWei(7.8, 'mwei').toNumber()
        },

        development: {
          host: "127.0.0.1",
          port: 7545,
          network_id: "5777",
          gas: 70000000,
          gasPrice: 1000000
        }
    }
};
