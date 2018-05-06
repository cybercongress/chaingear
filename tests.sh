#!/usr/bin/env bash
truffle compile
truffle test test/chaingear/ChaingearTests.js
truffle test test/registry/AllUsersRegistryEntryCrudTests.js
truffle test test/registry/OnlyAdminRegistryEntryCrudTests.js
truffle test test/registry/RegistryPermissionControlTests.js
truffle test test/registry/RegistryUpdateSettingsTests.js
truffle test test/SplitPaymentChangeableTests.js
exit
