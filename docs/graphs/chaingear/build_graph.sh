#!/usr/bin/env bash
solgraph Chaingear.sol > chaingear.dot
dot -Tpng chaingear.dot -o chaingear.png
