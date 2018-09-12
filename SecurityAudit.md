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
This type of pattern is experimental and can report false issues. This pattern might be also triggered when 
- accessing structs field
- using enums element

To avoid this vulnerability you can use the Checks-Effects-Interactions pattern.

Examples: 

** Registry_full.sol **
```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```
** Registry_full.sol **
```solidity

require(uint8(CreateEntryPermissionGroup.AllUsers) >=_createEntryPermissionGroup);

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