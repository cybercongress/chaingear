#!/usr/bin/env bash
truffle-flattener ../../contracts/registry/Registry.sol ../../contracts/chaingear/Chaingear.sol ../../contracts/example/TeamSchema.sol ../../contracts/builder/RegistryBuilder.sol > contracts_full.sol
