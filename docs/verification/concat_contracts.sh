#!/usr/bin/env bash
truffle-flattener ../../contracts/registry/Registry.sol > Registry_full.sol
truffle-flattener ../../contracts/chaingear/Chaingear.sol > Chaingear_full.sol
truffle-flattener ../../contracts/example/TeamSchema.sol > TeamSchema_full.sol
truffle-flattener ../../contracts/builder/RegistryBuilder.sol > Builder_full.sol
