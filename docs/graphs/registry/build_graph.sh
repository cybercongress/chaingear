#!/usr/bin/env bash
solgraph Registry.sol > registry.dot
dot -Tpng registry.dot -o registry.png
