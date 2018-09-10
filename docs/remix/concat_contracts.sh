#!/usr/bin/env bash
truffle-flattener ../../contracts/registry/Registry.sol ../../contracts/chaingear/Chaingear.sol ../../contracts/registry/EntryCore.sol > contracts_full.sol
