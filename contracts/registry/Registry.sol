pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "./EntryBase.sol";
// import "../common/RegistrySafe.sol";

/* contract Registry is Chaingeareable, ERC721Token, SplitPaymentChangeable { */
contract Registry is Chaingeareable, ERC721Token {

    using SafeMath for uint256;
    using AddressUtils for address;

    function Registry(
        /* address[] _benefitiaries, */
        /* uint256[] _shares, */
        /* PermissionTypeEntries _permissionType, */
        uint _entryCreationFee,
        string _name,
        string _symbol,
        /* string _description, */
        // string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        /* SplitPaymentChangeable(_benefitiaries, _shares) */
        ERC721Token(_name, _symbol)
        public
        payable
    {
        /* permissionTypeEntries_ = _permissionType; */
        // linkABI_ = _linkABI;
        entryCreationFee_ = _entryCreationFee;
        registryName_ = _name;
        /* registryDescription_ = _description; */
        // registrySafe_ = new RegistrySafe();

        address deployedAddress;
        assembly {
          let s := mload(_bytecodeOfEntriesContract)
          let p := add(_bytecodeOfEntriesContract, 0x20)
          deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);

        entryBase_ = deployedAddress;
    }

    function createEntry(bytes _serializedParams)
        external
        payable
        onlyPermissionedToEntries
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);
        // EntryMeta memory meta = (EntryMeta(
        // {
        //     lastUpdateTime: block.timestamp,
        //     createdAt: block.timestamp,
        //     owner: msg.sender,
        //     creator: msg.sender,
        //     currentEntryBalanceETH: 0,
        //     accumulatedOverallEntryETH: 0
        // }));
        // Entry memory entry = (Entry(
        // {
        //     expensiveAddress: _expensiveAddress,
        //     expensiveUint: _expensiveUint,
        //     expensiveInt: _expensiveInt,
        //     expensiveString: _expensiveString,
        //     metainformation: meta
        // }));

        // uint256 newEntryId = entries.push(entry) - 1;
        uint256 newEntryId = EntryBase(entryBase_).createEntry(_serializedParams);
        _mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    // function deleteEntry(uint256 _entryId)
    //     whenNotPaused
    //     external
    // {
    //     require(ERC721BasicToken.ownerOf(_entryId) == msg.sender);

    //     uint256 entryIndex = allTokensIndex[_entryId];
    //     uint256 lastEntryIndex = entries.length.sub(1);
    //     Entry storage lastEntry = entries[lastEntryIndex];

    //     entries[entryIndex] = lastEntry;
    //     delete entries[lastEntryIndex];
    //     entries.length--;

    //     super._burn(msg.sender, _entryId);

    //     EntryDeleted(msg.sender, _entryId);
    // }


    // function transferEntryOwnership(uint _entryId, address _newOwner)
    //     whenNotPaused
    //     external
    // {
    //     require (ERC721BasicToken.ownerOf(_entryId) == msg.sender);
    //     // throw if balance?
    //     //locked balance?
    //     entries[_entryId].metainformation.owner = _newOwner;
    //     entries[_entryId].metainformation.lastUpdateTime = block.timestamp;

    //     super.removeTokenFrom(msg.sender, _entryId);
    //     super.addTokenTo(_newOwner, _entryId);

    //     EntryChangedOwner(_entryId, _newOwner);
    // }

    // function fundEntry(uint256 _entryId)
    //     whenNotPaused
    //     payable
    //     public
    // {
    //     entries[_entryId].metainformation.accumulatedOverallEntryETH.add(msg.value);
    //     registrySafe_.transfer(msg.value);

    //     EntryFunded(_entryId, msg.sender);
    // }

    // function claimEntryFunds(uint256 _entryId, uint _amount)
    //     whenNotPaused
    //     public
    // {
    //     require(ERC721BasicToken.ownerOf(_entryId) == msg.sender);
    //     require(_amount <= entries[_entryId].metainformation.currentEntryBalanceETH);
    //     entries[_entryId].metainformation.currentEntryBalanceETH.sub(_amount);
    //     RegistrySafe(registrySafe_).claim(msg.sender, _amount);

    //     EntryFundsClaimed(_entryId, msg.sender, _amount);
    // }
}
