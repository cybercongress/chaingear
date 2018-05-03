pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "./EntryBase.sol";
import "../common/RegistrySafe.sol";

/**
* @title Entries of Registry processor
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract Registry is Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;

    /**
    * @dev Registry constructor, deployment
    * @param benefitiaries' addresses[]
    * @param charging shares uint256[]
    * @param Registry name string
    * @param Registry symbol string
    * @param link to ABI of entries contract string
    * @param bytecode of entries contract bytes
    */
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

/**
* @dev entry creation
* @return new entry ID uint256
*/
    function createEntry()
        external
        whenNotPaused
        onlyPermissionedToEntries
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);

        uint256 newEntryId = EntryBase(entryBase_).createEntry();
        _mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    /**
    * @dev delegate tokenized ownership to new admin
    * @param new owner (admin) address
    */
    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        onlyOwner
    {
        registryOwner_ = _newOwner;
    }

    /**
    * @dev remove entry from the Regisrty
    * @param entry ID uint256
    */
    function deleteEntry(uint256 _entryId)
        external
        whenNotPaused
    {
        require(ERC721BasicToken.ownerOf(_entryId) == msg.sender);

        uint256 entryIndex = allTokensIndex[_entryId];
        EntryBase(entryBase_).deleteEntry(entryIndex);
        super._burn(msg.sender, _entryId);

        EntryDeleted(msg.sender, _entryId);
    }

    /**
    * @dev delegate entry tokenized ownership to new owner
    * @param entry ID uint256
    * @param new owner address
    */
    function transferEntryOwnership(uint _entryId, address _newOwner)
        public
        whenNotPaused
    {
        require (ownerOf(_entryId) == msg.sender);
        EntryBase(entryBase_).updateEntryOwnership(_entryId, _newOwner);

        super.removeTokenFrom(msg.sender, _entryId);
        super.addTokenTo(_newOwner, _entryId);

        EntryChangedOwner(_entryId, _newOwner);
    }

    /**
    * @dev entry fund setter
    * @param entry ID uint256
    */
    function fundEntry(uint256 _entryId)
        public
        whenNotPaused
        payable
    {
        EntryBase(entryBase_).updateEntryFund(_entryId, msg.value);
        registrySafe_.transfer(msg.value);

        EntryFunded(_entryId, msg.sender);
    }

    /**
    * @dev entry fund claimer
    * @param entry ID uint256
    * @param claim amount uint
    */
    function claimEntryFunds(uint256 _entryId, uint _amount)
        public
        whenNotPaused
    {
        require(ownerOf(_entryId) == msg.sender);
        require(_amount <= EntryBase(entryBase_).currentEntryBalanceETHOf(_entryId));
        EntryBase(entryBase_).claimEntryFund(_entryId, _amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        EntryFundsClaimed(_entryId, msg.sender, _amount);
    }

    /**
    * @dev safe balance getter
    * @return balance uint
    */
    function safeBalance()
        public
        view
        returns (uint balance)
    {
        return RegistrySafe(registrySafe_).balance;
    }
}
