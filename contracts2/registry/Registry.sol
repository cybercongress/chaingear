pragma solidity ^0.4.19;

import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/AddressUtils.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "./EntryBase.sol";
import "../common/RegistrySafe.sol";

contract Registry is Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    using AddressUtils for address;

    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        permissionTypeEntries_ = PermissionTypeEntries.OnlyCreator;
        registryName_ = _name;
        linkToABIOfEntriesContract_ = _linkToABIOfEntriesContract;
        registrySafe_ = new RegistrySafe();

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

        uint256 newEntryId = EntryBase(entryBase_).createEntry(_serializedParams);
        _mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    function transferTokenizedOnwerhip(address _newOwner)
        public
        onlyOwner
    {
        creator_ = _newOwner;
    }

     /* function deleteEntry(uint256 _entryId)
         whenNotPaused
         external
     {
         require(ERC721BasicToken.ownerOf(_entryId) == msg.sender);

         uint256 entryIndex = allTokensIndex[_entryId];
         uint256 lastEntryIndex = entries.length.sub(1);
         Entry storage lastEntry = entries[lastEntryIndex];

         entries[entryIndex] = lastEntry;
         delete entries[lastEntryIndex];
         entries.length--;

         super._burn(msg.sender, _entryId);

         EntryDeleted(msg.sender, _entryId);
     } */


     function transferEntryOwnership(uint _entryId, address _newOwner)
         public
     {
         require (ownerOf(_entryId) == msg.sender);
         EntryBase(entryBase_).updateEntryOwnership(_entryId, _newOwner);

         super.removeTokenFrom(msg.sender, _entryId);
         super.addTokenTo(_newOwner, _entryId);

         EntryChangedOwner(_entryId, _newOwner);
     }

     function fundEntry(uint256 _entryId)
         payable
         public
     {
         EntryBase(entryBase_).updateEntryFund(_entryId, msg.value);
         registrySafe_.transfer(msg.value);

         EntryFunded(_entryId, msg.sender);
     }

     function claimEntryFunds(uint256 _entryId, uint _amount)
         public
     {
         require(ownerOf(_entryId) == msg.sender);
         require(_amount <= EntryBase(entryBase_).currentEntryBalanceETHOf(_entryId));
         EntryBase(entryBase_).claimEntryFund(_entryId, _amount);
         RegistrySafe(registrySafe_).claim(msg.sender, _amount);

         EntryFundsClaimed(_entryId, msg.sender, _amount);
     }
}
