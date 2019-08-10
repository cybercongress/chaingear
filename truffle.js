const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');

// const infuraConfigKovan = require('./infura_deploy_kovan.json');
// const infuraConfigRinkeby = require('./infura_deploy_rinkeby.json');
// const infuraConfigMainnet = require('./infura_deploy_mainnet.json');

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
        
        // kovan: {
        //     provider() {
        //       return new HDWalletProvider(infuraConfigKovan.privateKey, infuraConfigKovan.infuraUrl);
        //     },
        //     from: infuraConfigKovan.fromAddress,
        //     network_id: 42,
        //     gasPrice: toWei(10, 'gwei').toNumber(),
        //     gas: toWei(7, 'mwei').toNumber(),
        //     confirmations: 2,
        //     skipDryRun: true
        // },
        
        // rinkeby: {
        //     provider() {
        //       return new HDWalletProvider(infuraConfigRinkeby.privateKey, infuraConfigRinkeby.infuraUrl);
        //     },
        //     from: infuraConfigRinkeby.fromAddress,
        //     network_id: 4,
        //     gasPrice: toWei(10, 'gwei').toNumber(),
        //     gas: toWei(6.8, 'mwei').toNumber(),
        //     confirmations: 2,
        //     skipDryRun: true
        // },
        
        // mainnet: {
        //     provider() {
        //       return new HDWalletProvider(infuraConfigMainnet.privateKey, infuraConfigMainnet.infuraUrl);
        //     },
        //     from: infuraConfigMainnet.fromAddress,
        //     network_id: 1,
        //     gasPrice: toWei(10, 'gwei').toNumber(),
        //     gas: toWei(7, 'mwei').toNumber(),
        //     confirmations: 2,
        //     skipDryRun: true
        // },
        
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*",
            websockets: true
        }
    }
};
