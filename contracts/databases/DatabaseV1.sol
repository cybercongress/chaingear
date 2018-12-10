pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../common/IChaingear.sol";
import "../common/ISchema.sol";
import "../common/IDatabase.sol";
import "../common/Safe.sol";
import "./DatabasePermissionControl.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract DatabaseV1 is IDatabase, Ownable, DatabasePermissionControl, SupportsInterfaceWithLookup, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    bytes4 constant internal INTERFACE_SCHEMA_ID = 0x153366ed;
    bytes4 constant internal INTERFACE_DATABASE_ID = 0xfdb63525;

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address     creator;
        uint256     createdAt;
        uint256     lastUpdateTime;
        uint256     currentWei;
        uint256     accumulatedWei;
    }
    
    EntryMeta[] private entriesMeta;
    
    uint256 private headTokenID = 0;
    uint256 private entryCreationFeeWei = 0;
    
    bytes32[] private databaseTags;
    string private databaseDescription;
    
    string private linkToSchemaABI; // will be depricated
    string private schemaDefinition; // and changed for this
    
    Safe private databaseSafe;
    
    ISchema private entriesStorage;
    bool private databaseInitStatus = false;
    
    /*
    *  Modifiers
    */
    
    modifier onlyOwnerOf(uint256 _entryID){
        require(ownerOf(_entryID) == msg.sender);
        _;
    }
    
    modifier databaseInitialized {
        require(databaseInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    event EntryCreated(
        uint256 entryID,
        address creator
    );

    event EntryDeleted(
        uint256 entryID,
        address owner
    );

    event EntryFunded(
        uint256 entryID,
        address funder,
        uint256 amount
    );

    event EntryFundsClaimed(
        uint256 entryID,
        address claimer,
        uint256 amount
    );
    
    event EntryCreationFeeUpdated(
        uint256 newFees
    );
    
    event DescriptionUpdated(
        string newDescription
    );
    
    event DatabaseInitialized();

    /*
    *  Constructor
    */

    constructor(
        address[] _beneficiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        ERC721Token (_name, _symbol)
        SplitPayment (_beneficiaries, _shares)
        public
        payable
    {
        _registerInterface(INTERFACE_DATABASE_ID);
        databaseSafe = new Safe();
    }
    
    function() external payable {}
    
    /*
    *  External functions
    */
    
    function createEntry()
        external
        databaseInitialized
        onlyPermissionedToCreateEntries
        whenNotPaused
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFeeWei);
        
        EntryMeta memory meta = (EntryMeta(
        {   
            lastUpdateTime: block.timestamp,
            createdAt:      block.timestamp,
            creator:        msg.sender,
            currentWei:     0,
            accumulatedWei: 0
        }));
        entriesMeta.push(meta);
        
        uint256 newTokenID = headTokenID;
        super._mint(msg.sender, newTokenID);
        headTokenID = headTokenID.add(1);
        
        emit EntryCreated(newTokenID, msg.sender);

        entriesStorage.createEntry();
        
        return newTokenID;
    }
    
    function auth(uint256 _entryID, address _caller)
        external
        whenNotPaused
    {
        require(msg.sender == address(entriesStorage));
        require(ownerOf(_entryID) == _caller);
        uint256 entryIndex = allTokensIndex[_entryID];
        entriesMeta[entryIndex].lastUpdateTime = block.timestamp;
    }

    function deleteEntry(uint256 _entryID)
        external
        databaseInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        require(entriesMeta[entryIndex].currentWei == 0);
        
        uint256 lastEntryIndex = entriesMeta.length.sub(1);
        EntryMeta memory lastEntry = entriesMeta[lastEntryIndex];
        
        entriesMeta[entryIndex] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        super._burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        entriesStorage.deleteEntry(entryIndex);
    }

    function fundEntry(uint256 _entryID)
        external
        databaseInitialized
        whenNotPaused
        payable
    {
        require(exists(_entryID) == true);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        uint256 currentWei = entriesMeta[entryIndex].currentWei.add(msg.value);
        entriesMeta[entryIndex].currentWei = currentWei;
        
        uint256 accumulatedWei = entriesMeta[entryIndex].accumulatedWei.add(msg.value);
        entriesMeta[entryIndex].accumulatedWei = accumulatedWei;
        
        emit EntryFunded(_entryID, msg.sender, msg.value);
        address(databaseSafe).transfer(msg.value);
    }

    function claimEntryFunds(uint256 _entryID, uint256 _amount)
        external
        databaseInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
    
        uint256 currentWei = entriesMeta[entryIndex].currentWei;
        require(_amount <= currentWei);
        entriesMeta[entryIndex].currentWei = currentWei.sub(_amount);
    
        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
        databaseSafe.claim(msg.sender, _amount);
    }
    
    function updateEntryCreationFee(uint256 _newFee)
        external
        onlyAdmin
        whenPaused
    {
        entryCreationFeeWei = _newFee;
        emit EntryCreationFeeUpdated(_newFee);
    }
    
    function updateDatabaseDescription(string _newDescription)
        external
        onlyAdmin
    {    
        databaseDescription = _newDescription;
        emit DescriptionUpdated(_newDescription);
    }
    
    function addDatabaseTag(bytes32 _tag)
        external
        onlyAdmin
    {
        require(databaseTags.length < 16);
        databaseTags.push(_tag);
    }
    
    function updateDatabaseTag(uint8 _index, bytes32 _tag)
        external
        onlyAdmin
    {
        require(_index < databaseTags.length);
    
        databaseTags[_index] = _tag;
    }

    function removeDatabaseTag(uint8 _index)
        external
        onlyAdmin
    {
        require(databaseTags.length > 0);
        require(_index < databaseTags.length);
    
        uint256 lastTagIndex = databaseTags.length.sub(1);
        bytes32 lastTag = databaseTags[lastTagIndex];
    
        databaseTags[_index] = lastTag;
        databaseTags[lastTagIndex] = "";
        databaseTags.length--;
    }
    
    /*
    *  View functions
    */
    
    function readEntryMeta(uint256 _entryID)
        external
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        require(exists(_entryID) == true);
        uint256 entryIndex = allTokensIndex[_entryID];
        
        EntryMeta memory m = entriesMeta[entryIndex];
        return(
            ownerOf(_entryID),
            m.creator,
            m.createdAt,
            m.lastUpdateTime,
            m.currentWei,
            m.accumulatedWei
        );
    }
    
    function getChaingearID()
        external
        view
        returns(uint256)
    {
        return IChaingear(owner).getDatabaseIDByAddress(address(this));
    }
    
    function getEntriesIDs()
        external
        view
        returns (uint256[])
    {
        return allTokens;
    }
    
    function getIndexByID(uint256 _entryID)
        external
        view
        returns (uint256)
    {
        require(exists(_entryID) == true);
        return allTokensIndex[_entryID];
    }
    
    function getEntryCreationFee()
        external
        view
        returns (uint256)
    {
        return entryCreationFeeWei;
    }
    
    function getEntriesStorage()
        external
        view
        returns (address)
    {
        return address(entriesStorage);
    }
    
    function getInterfaceEntriesContract() // will be depricated 
        external
        view
        returns (string)
    {
        return linkToSchemaABI;
    }
    
    function getSchemaDefinition() // and migrated to this with determinated ABI
        external
        view
        returns (string)
    {
        return schemaDefinition;
    }
    
    function getDatabaseBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }
    
    function getDatabaseDescription()
        external
        view
        returns (string)
    {
        return databaseDescription;
    }
    
    function getDatabaseTags()
        external
        view
        returns (bytes32[])
    {
        return databaseTags;
    }
    
    function getDatabaseSafe()
        external
        view
        returns (address)
    {
        return databaseSafe;
    }
    
    function getSafeBalance()
        external
        view
        returns (uint256)
    {
        return address(databaseSafe).balance;
    }
    
    function getDatabaseInitStatus()
        external
        view
        returns (bool)
    {
        return databaseInitStatus;
    }
    
    /**
    *  Public functions
    */
    
    function initializeDatabase(string _linkToABI, bytes _schemaBytecode)
        public
        onlyAdmin
        returns (address)
    {
        require(databaseInitStatus == false);
        address deployedAddress;
    
        assembly {
            let s := mload(_schemaBytecode)
            let p := add(_schemaBytecode, 0x20)
            deployedAddress := create(0, p, s)
        }
    
        require(deployedAddress != address(0));
        require(SupportsInterfaceWithLookup(deployedAddress).supportsInterface(INTERFACE_SCHEMA_ID));
        entriesStorage = ISchema(deployedAddress);
    
        linkToSchemaABI = _linkToABI;
        databaseInitStatus = true;
        
        emit DatabaseInitialized();
        return deployedAddress;
    }
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        databaseInitialized
        whenNotPaused
    {
        super.transferFrom(_from, _to, _tokenId);
    }  
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        databaseInitialized
        whenNotPaused
    {
        super.safeTransferFrom(
            _from,
            _to,
            _tokenId,
            ""
        );
    }
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    )
        public
        databaseInitialized
        whenNotPaused
    {
        transferFrom(_from, _to, _tokenId);
        require(
            checkAndCallSafeTransfer(
                _from,
                _to,
                _tokenId,
                _data
        ));
    }
}
