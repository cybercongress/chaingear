#!/usr/bin/env bash
truffle-flattener ../../../contracts/chaingear/Chaingear.sol > Chaingear_full.sol
solgraph Chaingear_full.sol > chaingear_full.dot
dot -Tpng chaingear_full.dot -o chaingear_full.png

truffle-flattener ../../../contracts/registry/Registry.sol > Registry_full.sol
solgraph Registry_full.sol > registry_full.dot
dot -Tpng registry_full.dot -o registry_full.png
