const { toWei } = require('ethjs-unit');
const HDWalletProvider = require('truffle-hdwallet-provider');

const infuraConfig = require('./infura_deploy.json');

module.exports = {

    solc: {
        optimizer: {
            enabled: true,
            runs: 1000
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

        infura: {
            provider() {
              return new HDWalletProvider(infuraConfig.privateKey, infuraConfig.infuraUrl);
            },
            from: infuraConfig.fromAddress,

            network_id: 42,
            gasPrice: toWei(10, 'gwei').toNumber(),
            gas: toWei(7.9, 'mwei').toNumber(),
        },

        kovan: {
            host: "127.0.0.1",
            port: 8545,
            from: '0x379A23083a58B2b89F4dD307aD55F732BB5A20Ef',
            network_id: 42,
            gasPrice: toWei(10, 'gwei').toNumber(),
            gas: toWei(7.2, 'mwei').toNumber(),
            websockets: true
        },

        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "5777",
            gasPrice: toWei(10, 'gwei').toNumber(),
            gas: toWei(7.2, 'mwei').toNumber(),
            websockets: true
        }
    }
};
