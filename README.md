<h1 align="center">
  <img src="https://raw.githubusercontent.com/cybercongress/chaingear/ERC721-integration/chaingear.png"
  alt="chaingear" width="970"></a>
</h1>


<h3 align="center">Most expensive Registry</h3>
<div align="center">
  Chaingear is an Ethereum ERC721-based registries framework.
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square" alt="Ethereum" />
  <img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square" alt="Token ERC721" />
  <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
  <a href="https://travis-ci.org/cryppadotta/dotta-license"> [![CircleCI](https://circleci.com/gh/cyberFund/chaingear/tree/master.svg?style=svg)](https://circleci.com/gh/cyberFund/chaingear/tree/master)
  <a href="https://t.me/joinchat/Bze3dEPj5YrvZ3REnMrfPg"> <img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square" alt="Join Us On Telegram" /></a>
</div>

<div align="center">
  <sub>Built by
  <a href="https://twitter.com/cyber_devs">cyber•Search</a> and
  <a href="https://github.com/cyberFund/chaingear/graphs/contributors">
    contributors
  </a>
</div>

# Overview

# Features

# Contracts Overview

# FAQ

# Configuring and deploying

##### Deploy contract:

```
parity ui --chain=kovan

truffle migrate --network=kovan
```

PS: approve transaction in parity ui (http://127.0.0.1:8180/)

Build contract in file:

```
truffle-flattener contracts/common/Chaingeareable.sol >> app/src/Chaingeareable.sol
```

##### Linting:

```
npm install -g solium

solium -d contracts
```

##### Development environment
Recommending to use [Remix Ethereum Online IDE](remix.ethereum.org)  or [desktop electron-based Remix IDE](https://github.com/horizon-games/remix-app)

PS: to import to IDE open-zeppelin contacts follow this:
```
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol";
```

# Join Us On Telegram

If you're interested in using or developing Chaingear, come [join us on Telegram](https://t.me/joinchat/Bze3dEPj5YrvZ3REnMrfPg)

# Built With

* [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)
* [Truffle](https://truffleframework.com)
* [Web3.js](https://github.com/ethereum/web3.js/)

# Authors

Originally created by [cyber•Congress](https://twitter.com/cyber_devs)

# License

[MIT](https://opensource.org/licenses/MIT)
