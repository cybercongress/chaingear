const { toWei } = require('ethjs-unit');

module.exports = {

    solc: {
        setting: {
            optimizer: {
                enabled: true,
                runs: 200
            }
            // evmVersion: "byzantium",
        },
        version: "0.4.25"
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
            gas: toWei(7.0, 'mwei').toNumber(),
            websockets: true
        },

        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "5777",
            gasPrice: toWei(10, 'gwei').toNumber(),
            gas: toWei(7.0, 'mwei').toNumber(),
            websockets: true
        }
    }
};
