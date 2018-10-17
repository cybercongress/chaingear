const { toWei } = require('ethjs-unit');

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

        kovan: {
            host: "localhost",
            port: 8545,
            from: '0xf2492533F7d89DBfEd69757156c4B746839E59E8',
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
