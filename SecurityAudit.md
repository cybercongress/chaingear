<h1 align="center">
  <img src="/logo_chaigear_970.png"
  alt="chaingear" width="970"></a>
</h1>

<h3 align="center">Security Audit Of Chaingear's Contracts</h3>
<h3 align="center">The most expensive Registry</h3>
<div align="center">
  Chaingear is an Ethereum ERC721-based registries framework.
</div>

<br />

# Disclaimer 

The audit isn’t a legal document that verifies that the code is secure. Nobody can assure that the code won’t have future bugs or vulnerabilities.  

The scope of this audit was to analyze and document CHAINGEAR’s smart contract codebase for quality, security and correctness. This audit guarantees that your code has been revised by an expert and it’s secure. 

# Issues found 

## DoS by external function call in require

The contract that calls functions of other contracts should not rely on results of these functions. Be careful when verifying the result of external calls with <code>require</code> as called contract can always return false and prevent correct execution. Especially if the contract relies on state changes made by this function.
Calls to untrusted contracts can introduce several unexpected risks or errors. External calls may execute malicious code in that contract or any other contract that it depends upon. As such, every external call should be treated as a potential security risk. 

This type of pattern is experimental and can report false issues. This pattern might be also triggered when: 
- accessing structs field
- using enums element

To avoid this vulnerability you can use the Checks-Effects-Interactions pattern.

Examples: 

** Registry_full.sol | Line: 1422 | Severity: 1 **

```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```
** Registry_full.sol | Line:942 |  Severity: 1 **

```solidity

require(uint8(CreateEntryPermissionGroup.AllUsers) >=_createEntryPermissionGroup);

```

** EntryCore_full.sol | Line: 117 | Severity: 1 **

```solidity

require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));

```

** EntryCore_full.sol | Line: 99 | Severity: 1 **

```solidity

require(owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender));

```

** contracts_full.sol | Line: 2199 | Severity: 1 **

``` solidity

require(RegistryInterface(registryAddress).getSafeBalance() == 0);

```

** contracts_full.sol | Line: 942 | Severity: 1 **

```solidity

 require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);

```

** contracts_full.sol | Line: 2386 | Severity: 1 **

```solidity

require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));

```

** contracts_full.sol | Line: 1493 | Severity: 1 **

```solidity

require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);

```

** contracts_full.sol | Line: 1422 | Severity: 1 **

```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```

** contracts_full.sol | Line: 2250 | Severity: 1 **

```solidity

require(_amount <= registries[_registryID].currentRegistryBalanceETH);

```

** contracts_full.sol | Line: 2368 | Severity: 1 **

```solidity

require(owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender));

```

** chaingear_full.sol | Line: 2250 | Severity: 1 **

```solidity

require(_amount <= registries[_registryID].currentRegistryBalanceETH);

```

## Using the approve function of the ERC-20 standard

## No return statement for function that returns value 

## Costly loop

## Locked money

## No payable fallback function

## Reentrancy 

## Timestamp dependance

## Unchecked math

## Using assembly

## The incompletness of the compiler: view-function 

## Implicit visibility level