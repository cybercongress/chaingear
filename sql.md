# Chaingear: CRUD database on Ethereum
Here we offer simple but flexible CRUD database which allow creation of incentivized registries with decentralized permission control.

## Philosophy
Everything is a contract

## Features
- expensive
- open-source
- migratability
- economic incentives. Registry creators can set up fee beneficiaries.
- beneficiaries can be complex structure.
- registry_name: ENS name. Resolver is registry contract
- registry_description: 256 chars. Can be string or IPFS hash or Swarm hash. Optional
- registry tags: 64 chars. Optional
- registries can be updated either by owners or entry creators

## Interfaces

Fabric proxy: Ownable, Benificiaries, Destroyable
- getBuilder
- setBuilder
- getFee
- setFee
- getRegistries (reg address, reg name, creator)

Builder: Ownable, Destroyable
- version
- create()

Registry: Benificiaries, Owner, Destroyable
- permissionType: OnlyOwner, All, PermissionList
- getCreationFee
- setCreationFee
- getEntries
- createEntry (permissions)
- readEntry
- deleteEntry (permissions)

Entry: Ownable, Destroyable(if not in registry)
- readAttribute
- updateAttribute (only owner)
- getFee
- setFee (only owner)

Ownable:
- getOwner
- transferOwnership

Destroyable:
- destroy

Benificiaries: Ownable
  default - owner
- get ben
- add ben (only owner)
- delete ben (only owner)
