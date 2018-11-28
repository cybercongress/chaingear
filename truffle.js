const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');

const infuraConfig = require('./infura_deploy.json');

module.exports = {

    solc: {
        optimizer: {
            enabled: true,
            runs: 500
        }
    },

    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions: {
            currency: 'USD',
            gasPrice: 10
        }
    },

    networks: {
        
        kovan: {
            provider() {
              return new HDWalletProvider(infuraConfig.privateKey, infuraConfig.infuraUrl);
            },
            from: infuraConfig.fromAddress,
            network_id: 42,
            gasPrice: toWei(10, 'gwei').toNumber(),
            gas: toWei(7.9, 'mwei').toNumber()
        },
        
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
            websockets: true
        }
    }
};
