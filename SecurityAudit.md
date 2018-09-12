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

### Examples from Chaingear contracts

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

The contract does not have <code> payable </code> fallback. All attempts to <code> transfer </code> or <code> send </code> ether to this contract will be reverted.

A contract without a payable fallback function can receive Ether as a recipient of a coinbase transaction (aka miner block reward) or as a destination of a <code> selfdestruct </code>.

A contract cannot react to such Ether transfers and thus also cannot reject them. This is a design choice of the EVM and Solidity cannot work around it.

It also means that <code> address(this).balance </code> can be higher than the sum of some manual accounting implemented in a contract (i.e. having a counter updated in the fallback function).

### Examples from Chaingear contracts

**Registry_full.sol | Lines: 1229-1234 | Severity: 1**

```solidity

contract EntryInterface {

    function entriesAmount() external view returns (uint256);
    function createEntry() external returns (uint256);
    function deleteEntry(uint256) external;
}

```

**Registry_full.sol | Lines: 956-1225 | Severity: 1**

```solidity

contract Chaingeareable is RegistryPermissionControl {
    
    /*
    *  Storage
    */
    
    // @dev entry creation fee 
    uint internal entryCreationFee;
    
    // @dev registry description string
    string internal registryDescription;
    
    // @dev registry tags
    bytes32[] internal registryTags;
    
    // @dev address of EntryCore contract, which specifies data schema and operations
    address internal entriesStorage;
    
    // @dev link to IPFS hash to ABI of EntryCore contract
    string internal linkToABIOfEntriesContract;
    
    // @dev address of Registry safe where funds store
    address internal registrySafe;

    // @dev state of was registry initialized with EntryCore or not
    bool internal registryInitStatus;

    /*
    *  Modifiers
    */

    // @dev don't allow to call registry entry functions before initialization
    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    // @dev Signals that new entry-token added to Registry
    event EntryCreated(
        uint entryID,
        address creator
    );

    // @dev Signals that entry-token changed owner
    event EntryChangedOwner(
        uint entryID,
        address newOwner
    );

    // @dev Signals that entry-token deleted 
    event EntryDeleted(
        uint entryID,
        address owner
    );

    // @dev Signals that entry-token funded with given amount
    event EntryFunded(
        uint entryID,
        address funder,
        uint amount
    );

    // @dev Signals that entry-token funds claimed by owner with given amount
    event EntryFundsClaimed(
        uint entryID,
        address owner,
        uint amount
    );

    /**
    *  External Functions
    */

    /**
    * @dev Allows admin set new registration fee, which entry creators should pay
    * @param _fee uint In wei which should be payed for creation/registration
    */
    function updateEntryCreationFee(
        uint _fee
    )
        external
        onlyAdmin
    {
        entryCreationFee = _fee;
    }

    /**
    * @dev Allows admin update registry description
    * @param _registryDescription string Which represents description
    * @notice Length of description should be less than 256 bytes
    */
    function updateRegistryDescription(
        string _registryDescription
    )
        external
        onlyAdmin
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription = _registryDescription;
    }

    /**
    * @dev Allows admin to add tag to registry
    * @param _tag bytes32 Tag
    * @notice Tags amount should be less than 16
    */
    function addRegistryTag(
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        registryTags.push(_tag);
    }

    /**
    * @dev Allows admin to update update specified tag
    * @param _index uint16 Index of tag to update
    * @param _tag bytes32 New tag value
    */
    function updateRegistryTag(
        uint16 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        require(_index <= registryTags.length-1);

        registryTags[_index] = _tag;
    }

    /**
    * @dev Remove registry tag
    * @param _index uint16 Index of tag to delete
    */
    function removeRegistryTag(
        uint16 _index
    )
        external
        onlyAdmin
    {
        uint256 lastTagIndex = registryTags.length - 1;
        bytes32 lastTag = registryTags[lastTagIndex];

        registryTags[_index] = lastTag;
        registryTags[lastTagIndex] = "";
        registryTags.length--;
    }
    
    /**
    *  View functions
    */

    /**
    * @dev Allows to get EntryCore contract which specified entry schema and operations
    * @return address of that contract
    */
    function getEntriesStorage()
        external
        view
        returns (address)
    {
        return entriesStorage;
    }

    /**
    * @dev Allows to get link interface of EntryCore contract
    * @return string with IPFS hash to JSON with ABI
    */
    function getInterfaceEntriesContract()
        external
        view
        returns (string)
    {
        return linkToABIOfEntriesContract;
    }

    /**
    * @dev Allows to get registry balance which represents accumulated fees for entry creations
    * @return uint Amount in wei accumulated in Registry Contract
    */
    function getRegistryBalance()
        external
        view
        returns (uint)
    {
        return address(this).balance;
    }

    /**
    * @dev Allows to check which amount fee needed for entry creation/registration
    * @return uint Current amount in wei needed for registration
    */
    function getEntryCreationFee()
        external
        view
        returns (uint)
    {
        return entryCreationFee;
    }

    /**
    * @dev Allows to get description of Registry
    * @return string which represents description 
    */
    function getRegistryDescription()
        external
        view
        returns (string)
    {
        return registryDescription;
    }

    /**
    * @dev Allows to get Registry Tags
    * @return bytes32[] array of tags
    */
    function getRegistryTags()
        external
        view
        returns (bytes32[])
    {
        return registryTags;
    }

    /**
    * @dev Allows to get address of Safe which Registry control (owns)
    * @return address of Safe contract
    */
    function getRegistrySafe()
        external
        view
        returns (address)
    {
        return registrySafe;
    }
    
    /**
    * @dev Allows to get amount of funds aggregated in Safe
    * @return uint Amount of funds in wei
    */
    function getSafeBalance()
        external
        view
        returns (uint balance)
    {
        return address(registrySafe).balance;
    }
    
    /**
    * @dev Allows to check state of Registry init with EntryCore
    * @return bool Yes/No
    */
    function getRegistryInitStatus()
        external
        view
        returns (bool)
    {
        return registryInitStatus;
    }
}

```

**Registry_full.sol | Lines:1238-1249 | Severity: 1**

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

**Registry_full.sol | Lines:757-792 | Severity: 1**

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

**Registry_full.sol | Lines: 73-94 | Severity: 1**

```solidity

contract ERC721Receiver {
  /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`,
   *  which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
   */
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   *  after a `safetransfer`. This function MAY throw to revert and reject the
   *  transfer. This function MUST use 50,000 gas or less. Return of other
   *  than the magic value MUST result in the transaction being reverted.
   *  Note: the contract address is always the message sender.
   * @param _from The sending address
   * @param _tokenId The NFT identifier which is being transfered
   * @param _data Additional data with no specified format
   * @return `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
   */
  function onERC721Received(address _from, uint256 _tokenId, bytes _data) public returns(bytes4);
}

```

**Registry_full.sol | Lines:  51-56 | Severity: 1**

```solidity

contract ERC721Metadata is ERC721Basic {
  function name() public view returns (string _name);
  function symbol() public view returns (string _symbol);
  function tokenURI(uint256 _tokenId) public view returns (string);
}

```

## Reentrancy 

Any interaction from a contract (A) with another contract (B) and any transfer of Ether hands over control to that contract (B). This makes it possible for B to call back into A before this interaction is completed.

This pattern is experimental and can report false issues. This pattern might also be triggered when:

- accessing struct's field
- using enum's element

Note that re-entrancy is not only an effect of Ether transfer but of any function call on another contract. Furthermore, you also have to take multi-contract situations into account. A called contract could modify the state of another contract you depend on.

### Examples from Chaingear contracts

**Registry.sol| Line: 105 | Severity: 3**

```solidity

entriesMeta.push(meta);

```

**Registry.sol | Line: 181 | Severity: 3**

```solidity

entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);

```

**Registry.sol | Line: 203 | Severity:3**

```solidity

require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);

```

**Registry.sol | Line: 221 | Severity: 3**

```solidity

entriesMeta[_entryID].lastUpdateTime = block.timestamp;

```

**Registry.sol | Line: 108 | Severity: 3**

```solidity

uint256 newEntryID = EntryInterface(entriesStorage).entriesAmount();

```

**Registry.sol | Line: 132 | Severity: 3**

```solidity

require(entriesMeta[_entryID].currentEntryBalanceETH == 0);

```

**Registry.sol | Line: 66 | Severity: 3**

```solidity

createEntryPermissionGroup = CreateEntryPermissionGroup.OnlyAdmin;

```

**Registry.sol | Line: 204 | Severity: 3**

```solidity

entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);

```

**Chaingear.sol | Line: 151 | Severity: 3**

```solidity

 string memory registryName = RegistryInterface(registryAddress).name();

```

**Chaingear.sol | Line: 119 | Severity: 3**

``` solidity

address registryAddress = registries[_tokenId].contractAddress;

```



## Timestamp dependance

## Unchecked math

## Using assembly

## The incompletness of the compiler: view-function 

## Implicit visibility level