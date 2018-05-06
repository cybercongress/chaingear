#!/usr/bin/env bash

truffle test test/chaingear/ChaingearTests.js
truffle test test/registry/OnlyAdminRegistryEntryCrudTests.js
truffle test test/registry/RegistryUpdateSettingsTests.js
truffle test test/registry/AllUsersRegistryEntryCrudTests.js
exit
