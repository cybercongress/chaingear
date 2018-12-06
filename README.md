<h1 align="center">
  <img src="/docs/logo_chaigear_970.png"
  alt="chaingear" width="470"></a>
</h1>

<h3 align="center">The novel Ethereum database framework</h3>
<div align="center">
  Chaingear is an Ethereum ERC721's database Dapp.
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square" alt="Ethereum" />
  <img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square" alt="Token ERC721" />
  <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square" alt="Contributions Welcome" />
</div>
<div align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
  <img href="https://circleci.com/gh/cybercongress/chaingear/tree/master" src="https://circleci.com/gh/cybercongress/chaingear/tree/master.svg?style=svg"
  alt="CircleCI"
  />
  <a href="https://t.me/joinchat/Bze3dEPj5YrvZ3REnMrfPg"> <img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square" alt="Join Us On Telegram" /></a>
  <img src="https://img.shields.io/badge/Shipping_faster_with-ZenHub-5e60ba.svg?style=flat-square" alt="Suprecharged By ZenHub" />
</div>

<div align="center">
  <sub>Built by
  <a href="https://twitter.com/cyber_devs">cyber•Congress</a> and
  <a href="https://github.com/cybercongress/chaingear/graphs/contributors">
    contributors
  </a>
</div>

# Overview

This project allows you to create your own Database of defined by you entries schema on Ethereum blockchain.
Entry type can be defined during creation, so you can put any custom logic you want (e.g.: validation, entry-level permission control) into the Entry. Entries are tokenized as NFTs.

You can create your own database in the Chaingear's Metadatabase, which is a single point of contol of all other databases. Databases on chaingear level are tokenized as NFTs. Chaingear is most expensive database on Ethereum, so you should pay for the database and entry creation.

## Features

#### Chaingear

1. Metadatabase of **Databases**; each one associated with ERC721 token
2. Fee-based Database creation
3. Creating Databases with different functionality
4. Token-based ownership/administration for Databases
5. Databases are funded with ETH

#### Custom database

1. Custom data structure for Database (EntryCore)
2. Each Entry is a ERC721 token
3. Fee-based Entry creation
4. Token-based ownership Entry management
5. Entry creation policies (Administrator, Whitelist, AllUsers)

#### Chaingear UI (browser/stand-alone web3 DApp)

1. Web3/Metamask/Truffle/IPFS based
2. Full Chaingear control interface
3. Full custom Database control interface
4. Schema smart-contract code generation on client
5. Database ABI saves in IPFS

## [Contracts Overview](https://cybersearch.io/Chaingear/contracts/)

## [Configuring and deploying](https://cybersearch.io/Chaingear/development/)

## General Chaingear/Database pipeline
![general_pipeline](docs/mermaid/pipelines-general_pipeline.svg)

## Join Us On Telegram

If you're interested in using or developing Chaingear, come [join us on Telegram](https://t.me/fuckgoogle)

## Gitcoin Tasks
<a href="https://gitcoin.co/explorer?q=congress">
    <img src="https://gitcoin.co/funding/embed?repo=https://github.com/cybercongress/chaingear">
</a>

## Built With

* [OpenZeppelin](https://zeppelin-solidity)
* [Truffle](https://truffleframework.com)
* [Web3.js](https://github.com/ethereum/web3.js/)
* [IPFS]()

## Prerequisites:

- [Node.js](https://nodejs.org/en/download/)
- [Truffle](http://truffleframework.com/)
- [Parity](https://www.parity.io/)

## Authors

Originally created by [cyber•Congress](https://twitter.com/cyber_devs)

## License

[MIT](https://opensource.org/licenses/MIT)
