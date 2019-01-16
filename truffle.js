const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');

const infuraConfig = require('./infura_deploy.json');

module.exports = {
    
    compilers: {    
        solc: {
            version: "0.4.25",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
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
            gas: toWei(7.9, 'mwei').toNumber(),
            confirmations: 2,
            skipDryRun: true
        },
        
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
            websockets: true
        },
    }
};
