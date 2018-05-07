pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "../common/EntryBasic.sol";
import "../common/RegistryBasic.sol";
import "../common/RegistrySafe.sol";


contract Registry is RegistryBasic, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    
    // TODO change to inner ERC721 modifier
    modifier onlyEntryOwner(uint256 _entryID) {
        require(ownerOf(_entryID) == msg.sender);
        _;
    }

    constructor(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        createEntryPermissionGroup_ = CreateEntryPermissionGroup.OnlyAdmin;
        registryName_ = _name;
        entryCreationFee_ = 0;
        registrySafe_ = new RegistrySafe();
        registryInitialized_ = false;
    }

    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (
            address entryBase
        )
    {
        address deployedAddress;
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);
        entryBase_ = deployedAddress;
        registryInitialized_ = true;
        linkToABIOfEntriesContract_ = _linkToABIOfEntriesContract;
        
        return entryBase_;
    }

    /**
    * @dev entry creation
    * @return uint256
    */
    function createEntry()
        external
        whenNotPaused
        registryInitialized
        onlyPermissionedToCreateEntries
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);
        // TODO check for uniqueness for fields (+protected by uniq field gen)

        uint256 newEntryId = EntryBasic(entryBase_).createEntry();
        
        _mint(msg.sender, newEntryId);

        emit EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    //todo remove in favor of Adminable.changeAdmin()?
    /**
    * @dev delegate tokenized ownership to new admin
    * @param _newOwner address 
    */
    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        onlyOwner
    {
        admin_ = _newOwner;
    }

    /**
    * @dev remove entry from the Regisrty
    * @param _entryId uint256
    */
    function deleteEntry(uint256 _entryId)
        external
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        uint256 entryIndex = allTokensIndex[_entryId];
        EntryBasic(entryBase_).deleteEntry(entryIndex);
        super._burn(msg.sender, _entryId);

        emit EntryDeleted(msg.sender, _entryId);
    }

    /**
    * @dev delegate entry tokenized ownership to new owner
    * @param _entryId uint256
    * @param _newOwner address
    */
    function transferEntryOwnership(
        uint _entryId, 
        address _newOwner
    )
        public
        whenNotPaused
        registryInitialized
        onlyEntryOwner(_entryId)
    {
        EntryBasic(entryBase_).updateEntryOwnership(_entryId, _newOwner);

        super.removeTokenFrom(msg.sender, _entryId);
        super.addTokenTo(_newOwner, _entryId);

        emit EntryChangedOwner(_entryId, _newOwner);
    }

    /**
    * @dev entry fund setter
    * @param _entryId uint256
    */
    function fundEntry(uint256 _entryId)
        public
        whenNotPaused
        registryInitialized
        payable
    {
        EntryBasic(entryBase_).updateEntryFund(_entryId, msg.value);
        registrySafe_.transfer(msg.value);

        emit EntryFunded(_entryId, msg.sender);
    }

    /**
    * @dev entry fund claimer
    * @param _entryId uint256
    * @param _amount uint
    */
    function claimEntryFunds(
        uint256 _entryId, 
        uint _amount
    )
        public
        whenNotPaused
        registryInitialized
        onlyEntryOwner(_entryId)
    {
        require(_amount <= EntryBasic(entryBase_).currentEntryBalanceETHOf(_entryId));
        EntryBasic(entryBase_).claimEntryFund(_entryId, _amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        emit EntryFundsClaimed(_entryId, msg.sender, _amount);
    }

    /**
    * @dev safe balance getter
    * @return uint
    */
    function safeBalance()
        public
        view
        returns (uint balance)
    {
        return address(registrySafe_).balance;
    }
}
