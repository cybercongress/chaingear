# General purpose Registry Fabric

This project allows you to create your own Registry of general purpose entries on Ethereum blockchain.
Entry type is defined during creation, so you can put into entry any custom logic you want (validation, entry-level permission control).

## Components:
- *Registry Builder* allows any user to create his own registry. Building fee is collecting for builder services. All builded contracts are recorded into builder contract. Registry Builder supports multiple beneficiaries for building fee.
- *Registry Creator* contains a bytecode of current version of Registry. This bytecode used by Registry Builder for Registry creation. Registry Creator address can be changed in Registry Builder by it's owner.
- *Registry* is a contract, that implements basic CRUD database of some entries. Entry type (bytecode) in time of Registry instantiation. Registry supports entry creation fee charging, and basic permission management. Registry Builder supports multiple beneficiaries for creation fee.
- *Sample Entry* is an example of possible entry type. It support Read and Update operation of string field.
Additional validation and permission logic can be added into this contract.

## Prerequisites:

- [Node.js](https://nodejs.org/en/download/) v8.5.0+
- [Truffle](http://truffleframework.com/) v4.0.1+
- [Parity]()

## Registry creation workflow (for Kovan test network:

1. Launch Parity:
```
parity ui --chain=kovan
```

2. Deploy RegistryCreator and RegistryBuilder:
```
truffle migrate --network=kovan
```

3. Create new registry:
```
truffle console --network=kovan

var builder = RegistryBuilder.at(RegistryBuilder.address)
var client = 0x0
var beneficiaries = [] // beneficiary address
var shares = []
var permissionType = 1
var entryCreationFee = 1
var buildingFee = 1
var gas = 4000000

builder.createRegistry(client, beneficiaries, shares, permissionType, entryCreationFee, SampleEntry.bytecode, { value: buildingFee, gas: gas })
```

4. Create new entry:
```
var registry = builder.getLastContract().then(x => Registry.at(x))

// serialized constructor parameters with "a" value
var constructorParameters = "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000016100000000000000000000000000000000000000000000000000000000000000"

registry.then(x => x.createEntry(constructorParameters))
```

5. Read entry value:
```
var entry = registry.then(x => x.entries(0)).then(x => SampleEntry.at(x[0]))
entry.then(x => x.str())
```

6. Update entry:
```
entry.then(x => x.setStr('b'))
entry.then(x => x.str())
```

7. Delete entry:
```
registry.then(x => x.deleteEntry(0))
registry.then(x => x.isDeleted(0))
```

