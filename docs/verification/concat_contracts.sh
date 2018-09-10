#!/usr/bin/env bash
truffle-flattener ../../contracts/registry/Registry.sol > Registry_full.sol
truffle-flattener ../../contracts/chaingear/Chaingear.sol > Chaingear_full.sol
truffle-flattener ../../contracts/registry/EntryCore.sol > EntryCore_full.sol
