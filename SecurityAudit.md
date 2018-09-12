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

### Examples from Chaingear contracts

**Registry_full.sol | Line: 1422 | Severity: 1**

```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```
**Registry_full.sol | Line:942 |  Severity: 1**

```solidity

require(uint8(CreateEntryPermissionGroup.AllUsers) >=_createEntryPermissionGroup);

```

**EntryCore_full.sol | Line: 117 | Severity: 1**

```solidity

require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));

```

**EntryCore_full.sol | Line: 99 | Severity: 1**

```solidity

require(owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender));

```

**contracts_full.sol | Line: 2199 | Severity: 1**

```solidity

require(RegistryInterface(registryAddress).getSafeBalance() == 0);

```

**contracts_full.sol | Line: 942 | Severity: 1**

```solidity

 require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);

```

**contracts_full.sol | Line: 2386 | Severity: 1**

```solidity

require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));

```

**contracts_full.sol | Line: 1493 | Severity: 1**

```solidity

require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);

```

**contracts_full.sol | Line: 1422 | Severity: 1**

```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```

**contracts_full.sol | Line: 2250 | Severity: 1**

```solidity

require(_amount <= registries[_registryID].currentRegistryBalanceETH);

```

**contracts_full.sol | Line: 2368 | Severity: 1**

```solidity

require(owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender));

```

**chaingear_full.sol | Line: 2250 | Severity: 1**

```solidity

require(_amount <= registries[_registryID].currentRegistryBalanceETH);

```

## Using the approve function of the ERC-20 standard

The <code>approve</code> function of ERC-20 might lead to vulnerabilities.
Only use the <code> approve </code> function of the ERC-20 standard to change allowed amount to 0 or from 0 (wait till transaction is mined and approved).
The EIP-20 token's <code>approve</code> function creates the potential for an approved spender to spend more than the intended amount. A front running attack can be used, enabling an approved spender to call transferFrom() both before and after the call to approve() is processed.

### Real life example of an approve attack
<a href="https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit">ERC20 API: An Attack Vector on Approve/TransferFrom Methods</a>

### Examples from Chaingear contracts

**Registry_full.sol | Lines: 255-264 | Severity: 2**

```solidity

  function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

```
**contracts_full.sol | Lines: 255-264 | Severity: 2**

```solidity

function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

```

**chaingear_full.sol | Lines: 255-264 | Severity: 2**

```solidity

function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

```

**registry_full.sol | Lines: 255-264 | Severity: 2**

```solidity

function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

```

**Chaingear_full.sol | Lines: 255-264 | Severity: 2**

```solidity

function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

```


## No return statement for function that returns value 

There is no return value for a function whose signature only denotes the type of the return value.

If you don't need the return value of the function, do not specify <code>returns</code> in function signature.

### Examples from Chaingear contracts

**contracts_full.sol | Lines: 1549-1558 | Severity: 1**

```solidity

function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }

```

**registry_full.sol | Lines: 1549-1558 | Severity: 1**

```solidity

function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }

```

**chaingear_full.sol | Lines: 1906-1915 | Severity: 1**

```solidity

function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }

```

**Registry.sol | Lines: 259-268 | Severity: 1**

```solidity

function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }

```

**Chaingear_full.sol | Lines: 1906-1915 | Severity: 1**

```solidity

function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }

```



## Costly loop

Ethereum is a very resource-constrained environment. Prices per computational step are orders of magnitude higher than with centralized providers. Moreover, Ethereum miners impose a limit on the total number of gas consumed in a block. If <code> array.length </code> is large enough, the function exceeds the block gas limit, and transactions calling it will never be confirmed:

```solidity

for (uint256 i = 0; i < array.length ; i++) { 
		cosltyFunc();
	}

```

This becomes a security issue, if an external actor influences array.length. E.g., if array enumerates all registered addresses, an adversary can register many addresses, causing the problem described above.

Loops that do not have a fixed number of iterations, for example, loops that depend on storage values, have to be used carefully: Due to the block gas limit, transactions can only consume a certain amount of gas. Either explicitly or just due to normal operation, the number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. This may not apply to view functions that are only executed to read data from the blockchain. Still, such functions may be called by other contracts as part of on-chain operations and stall those. Please be explicit about such cases in the documentation of your contracts.

### Examples from Chaingear contracts

**Registry_full.sol | Lines: 667-669 | Severity: 2**

```solidity

for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }

```

**contracts_full.sol | Lines: 667-669 | Severity: 2**

```solidity

for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }

```    

**chaingear_full.sol | Lines: 667-669 | Severity: 2**

```solidity

for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }

```

**registry_full.sol | Lines: 667-669 | Severity: 2**

```solidity

 for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }

```

**Chaingear_full.sol | Lines:667-669 | Severity: 2**

```solidity

for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }

```


## Locked money

Contracts programmed to receive ether should implement a way to withdraw it, i.e., call <code>transfer</code> (recommended), <code>send</code>, or <code>call.value</code> at least once.

Implement a withdraw function or reject payments (contracts without a fallback function do it automatically).

The recommended method of sending funds after an effect is using the withdrawal pattern. Although the most intuitive method of sending Ether, as a result of an effect, is a direct send call, this is not recommended as it introduces a potential security risk.

#### Examples

**Registry_full.sol | Lines: 1238-1249 | Severity: 2**

```solidity

contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}

```

**Registry_full.sol | Lines:757-792 | Severity: 2**

```solidity

contract SplitPaymentChangeable is SplitPayment, Ownable {

    event PayeeAddressChanged(
        uint payeeIndex, 
        address oldAddress, 
        address newAddress
    );

    constructor(
        address[] _payees,
        uint256[] _shares
    )
        public
        payable
        SplitPayment(_payees, _shares)
    { }

    function changePayeeAddress(
        uint _payeeIndex,
        address _newAddress
    )
        external
        onlyOwner
    {
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}

```

**contracts_full.sol | Lines: 1238-1249 | Severity: 2**

```solidity

contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}

```

**chaingear_full.sol | Lines: 757-792 | Severity: 2**

```solidity

contract SplitPaymentChangeable is SplitPayment, Ownable {

    event PayeeAddressChanged(
        uint payeeIndex, 
        address oldAddress, 
        address newAddress
    );

    constructor(
        address[] _payees,
        uint256[] _shares
    )
        public
        payable
        SplitPayment(_payees, _shares)
    { }

    function changePayeeAddress(
        uint _payeeIndex,
        address _newAddress
    )
        external
        onlyOwner
    {
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}

```

**chaingear_full.sol | Lines: 796-807 | Severity: 2**

``solidity

contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}

``

**RegistryInterface.sol | Lines: 4-15 | Severity: 2**

```solidity

contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}

```


## No payable fallback function

## Reentrancy 

## Timestamp dependance

## Unchecked math

## Using assembly

## The incompletness of the compiler: view-function 

## Implicit visibility level