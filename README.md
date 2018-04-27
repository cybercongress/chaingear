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
  <img href="https://circleci.com/gh/cybercongress/chaingear/tree/master" src="https://circleci.com/gh/cybercongress/chaingear/tree/master.svg?style=svg"
  alt="CircleCI"
  />
  <a href="https://t.me/joinchat/Bze3dEPj5YrvZ3REnMrfPg"> <img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square" alt="Join Us On Telegram" /></a>
</div>

<div align="center">
  <sub>Built by
  <a href="https://twitter.com/cyber_devs">cyber•Search</a> and
  <a href="https://github.com/cybercongress/chaingear/graphs/contributors">
    contributors
  </a>
</div>

# Overview

This project allows you to create your own Registry of general purpose entries on Ethereum blockchain.
Entry type is defined during creation, so you can put into entry any custom logic you want (validation, entry-level permission control). Entries are tokenized as NFT.

Your creating your registry in Chaingear - metaregistry, which are one point of access to all registries. Registries on chaingear level are tokenized as NFT. Chaingear is most expensive registry, so you should pay for your registry creation.

# Features

#### Chaingear

- 1
- 2
- 3

#### Custom registry

- 1
- 2
- 3

#### Chaingear in browser

- 1
- 2
- 3

# Contracts Overview

### /chaingear
- **_Chaingear_** allows any user to create his own registry. Building fee is collecting by new registry creation. All builded registries are tokenized with ERC721 NFT token standard and saved in Chaingear metaregistry with registry metainformation. Creator of registry may transfer tokenized ownership of registry and destroy registry with token burning. Chaingear supports multiple benefitiaries witch have access to collected fees.

  ###### depends on:
    - _ERC721Token_
    - _SplitPaymentChangeable_
    - _ChaingearCore_
    - _Registry (int)_


- **_ChaingearCore_** holds general logic of Chaingear. Allows change chaingear's metainformation, amount of registration fee, set registry creator contract.

  ###### depends on:
    - _RegistryBase_
    - _IPFSeable_
    - _Destructible_
    - _Pausable_
    - _RegistryCreator (int)_


- **_RegistryBase_** holds struct of data with describes registry metainformation which associated with token, views function for registry metainformation.

- **_RegistryCreator_** contains the bytecode of current version of Registry. This bytecode used by Chaingear for Registry Creation. Registry Creator address can be changed in Chaingear by it's owner. Creation function can be only called by setted out chaingear address.

  ###### depends on:
    - _Registry_
    - _Ownable_

### /common
- [Seriality](https://github.com/pouladzade/Seriality) is a library for serializing and de-serializing all the Solidity types in a very efficient way which mostly written in solidity-assembly.

- **_IPFSeable_** contains logic which allows view and save links to CID in IPFS with ABI, source code and contract metainformation. Inherited by Chaingear and Registry.

  ###### depends on:
    - _Ownable_


- **_RegistySafe_** allows inherited contract transfer ETHs to safe and client claim from safe, accounting logic holded by inherited contract. Inherited by Chaingear and Registry.

  ###### depends on:
    - _Ownable_
    - _Destructible_


- **_SplitPaymentChangeable_** allows add beneficiaries to contract (addresses and shares amount) and change payee address. Beneficiaries can claim ETHs from contract proportionally to their shares. Inherited by Chaingear and Registry.

  ###### depends on:
    - _Ownable_
    - [_SplitPayment_](https://zeppelin-solidity/blob/master/contracts/payment/SplitPayment.sol)

### /registry
- **_Chaingeareable_** holds basic logic of Registry as registry basic information, balance and fees amount. Contains getters and setters for registry name, desciption, tags, entry base address.

  ###### depends on:
    - _IPFSeable_
    - _RegistryAccessControl_


- **_EntryBasic_** base for _EntryCore_. Holds entry metainformation and interfaces of functions (**C** _R_ **UD**) which should be implemented in _EntryCore_.

- **_EntryCore_** partilly codegenerated contract where registry creator setup their custom entry structure and setters/getters. _EntryCore_ then goes to Registry constructor as bytecode, where _EntryCore_ contract creates. Registry goes as owner of contract (and acts as proxy) with entries creating, transfering and deleting.

  ###### depends on:
    - _EntryBasic_
    - _Ownable_
    - _Seriality_


- **_Registry_** contract witch tokenize entries as NFT tokens via ERC721 standard. Users can create entries with structure described in _EntryCore_ sent serialized params according to entry access policy. Also users can fund entries with ETHs which send to _RegistrySafe_ where owner of entry can claim funds.

  ###### depends on:
    - _Chaingeareable_
    - _ERC721Token_
    - _SplitPaymentChangeable_
    - _EntryBasic (int)_


- **_RegistryAccessControl_** holds logic of controlling registry and accessing to entries creation. Policy options to entries creation are OnlyCreator, Whitelist, AllUsers. Chaingear acts as owner of registry and creator of registry acts of creator with separated policies to Registry functions.

  ###### depends on:
    - _Ownable_
    - _Destructible_

# FAQ

draft

Registry Creation
  - description should be setted on after creation
  - beneficiaries should be setted on after creation
  - \_permissionType by default is OnlyCreator
  - \_entryCreationFee by default is 0

TODO create interface in chaingear to pause/unpause registry

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
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
```

##### Truffle + Ganache workflow

Install Ganache from [latest release](https://github.com/trufflesuite/ganache/releases), then =>

```
npm install -g ganache-cli
```

Configure development config in truffle.js and launch Ganache (configure them too if needed) and:
```
ganache-cli -p 7545 (in first tab)
truffle migrate --network development --reset (in second tab)
truffle console --network development (in second tab)
```

##### Create new registry
```
var chaingear = Chaingear.at(Chaingear.address)

var beneficiaries = []
var shares = []
var buildingFee = 1000000
var gas = 10000000

chaingear.registerRegistry([], [], "BlockchainRegistry", "BLCHR", "", EntryCore.bytecode, {value: buildingFee, gas: 10000000})

```


# Join Us On Telegram

If you're interested in using or developing Chaingear, come [join us on Telegram](https://t.me/joinchat/Bze3dEPj5YrvZ3REnMrfPg)

# Built With

* [OpenZeppelin](https://zeppelin-solidity)
* [Truffle](https://truffleframework.com)
* [Web3.js](https://github.com/ethereum/web3.js/)
* [IPFS]()

# Prerequisites:

- [Node.js](https://nodejs.org/en/download/)
- [Truffle](http://truffleframework.com/)
- [Parity](https://www.parity.io/)

# Authors

Originally created by [cyber•Congress](https://twitter.com/cyber_devs)

# License

[MIT](https://opensource.org/licenses/MIT)
