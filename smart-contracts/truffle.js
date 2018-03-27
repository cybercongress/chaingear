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
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gasPrice: 10000000000,
      from: "0x00b2266565a2dF4dF0Dd473281b7bB88A86b27dd"
    }
  }
};
