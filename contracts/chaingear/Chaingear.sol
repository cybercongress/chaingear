pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


import "../common/IDatabaseBuilder.sol";
import "../common/IDatabase.sol";
import "../common/Safe.sol";
import "../common/IChaingear.sol";
import "./FeeSplitterChaingear.sol";
import "../common/ERC721MetadataValidation.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract Chaingear is IChaingear, Ownable, SupportsInterfaceWithLookup, Pausable, FeeSplitterChaingear, ERC721Token {

    using SafeMath for uint256;
    using ERC721MetadataValidation for string;

    /*
    *  Storage
    */

    struct DatabaseMeta {
        IDatabase databaseContract;
        address creatorOfDatabase;
        string versionOfDatabase;
        string linkABI;
        uint256 createdTimestamp;
        uint256 currentWei;
        uint256 accumulatedWei;
    }

    struct DatabaseBuilder {
        IDatabaseBuilder builderAddress;
        string linkToABI;
        string description;
        bool operational;
    }

    DatabaseMeta[] private databases;
    mapping(string => bool) private databasesNamesIndex;
    mapping(string => bool) private databasesSymbolsIndex;

    uint256 private headTokenID = 0;
    mapping(address => uint256) private databasesIDsByAddressesIndex;
    mapping(string => address) private databasesAddressesByNameIndex;
    mapping(uint256 => string) private databasesSymbolsByIDIndex;
    mapping(string => uint256) private databasesIDsBySymbolIndex;

    uint256 private amountOfBuilders = 0;
    mapping(uint256 => string) private buildersVersionIndex;
    mapping(string => DatabaseBuilder) private buildersVersion;

    Safe private chaingearSafe;
    uint256 private databaseCreationFeeWei = 1 ether;

    string private constant CHAINGEAR_DESCRIPTION = "The novel Ethereum database framework";
    bytes4 private constant INTERFACE_CHAINGEAR_EULER_ID = 0xea1db66f; 
    bytes4 private constant INTERFACE_DATABASE_V1_EULER_ID = 0xf2c320c4;
    bytes4 private constant INTERFACE_DATABASE_BUILDER_EULER_ID = 0xce8bbf93;
    
    /*
    *  Events
    */
    event DatabaseBuilderAdded(
        string version,
        IDatabaseBuilder builderAddress,
        string linkToABI,
        string description
    );
    event DatabaseDescriptionUpdated(string version, string description);
    event DatabaseBuilderDepricated(string version);
    event DatabaseCreated(
        string name,
        address databaseAddress,
        address creatorAddress,
        uint256 databaseChaingearID
    );
    event DatabaseDeleted(
        string name,
        address databaseAddress,
        address creatorAddress,
        uint256 databaseChaingearID
    );
    event DatabaseFunded(
        uint256 databaseID,
        address sender,
        uint256 amount
    );
    event DatabaseFundsClaimed(
        uint256 databaseID,
        address claimer,
        uint256 amount
    );    
    event CreationFeeUpdated(uint256 newFee);

    /*
    *  Constructor
    */

    constructor(address[] _beneficiaries, uint256[] _shares)
        public
        ERC721Token ("CHAINGEAR", "CHG")
        FeeSplitterChaingear (_beneficiaries, _shares)
    {
        chaingearSafe = new Safe();
        _registerInterface(INTERFACE_CHAINGEAR_EULER_ID);
    }

    /*
    *  Modifiers
    */

    modifier onlyOwnerOf(uint256 _databaseID){
        require(ownerOf(_databaseID) == msg.sender);
        _;
    }

    /*
    *  External functions
    */

    function addDatabaseBuilderVersion(
        string _version,
        IDatabaseBuilder _builderAddress,
        string _linkToABI,
        string _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(buildersVersion[_version].builderAddress == address(0));

        SupportsInterfaceWithLookup support = SupportsInterfaceWithLookup(_builderAddress);
        require(support.supportsInterface(INTERFACE_DATABASE_BUILDER_EULER_ID));

        buildersVersion[_version] = (DatabaseBuilder(
        {
            builderAddress: _builderAddress,
            linkToABI: _linkToABI,
            description: _description,
            operational: true
        }));
        buildersVersionIndex[amountOfBuilders] = _version;
        amountOfBuilders = amountOfBuilders.add(1);
        
        emit DatabaseBuilderAdded(
            _version,
            _builderAddress,
            _linkToABI,
            _description
        );
    }

    function updateDatabaseBuilderDescription(string _version, string _description)
        external
        onlyOwner
        whenNotPaused
    {
        require(buildersVersion[_version].builderAddress != address(0));
        buildersVersion[_version].description = _description;    
        emit DatabaseDescriptionUpdated(_version, _description);
    }
    
    function depricateDatabaseBuilder(string _version)
        external
        onlyOwner
        whenPaused
    {
        require(buildersVersion[_version].builderAddress != address(0));
        require(buildersVersion[_version].operational == true);
        buildersVersion[_version].operational = false;
        emit DatabaseBuilderDepricated(_version);
    }

    function createDatabase(
        string    _version,
        address[] _beneficiaries,
        uint256[] _shares,
        string    _name,
        string    _symbol
    )
        external
        payable
        whenNotPaused
        returns (address, uint256)
    {
        _name.validateName();
        _symbol.validateSymbol();
        require(buildersVersion[_version].builderAddress != address(0));
        require(buildersVersion[_version].operational == true);
        require(databaseCreationFeeWei == msg.value);
        require(databasesNamesIndex[_name] == false);
        require(databasesSymbolsIndex[_symbol] == false);

        return _deployDatabase(
            _version,
            _beneficiaries,
            _shares,
            _name,
            _symbol
        );
    }

    function deleteDatabase(uint256 _databaseID)
        external
        onlyOwnerOf(_databaseID)
        whenNotPaused
    {
        uint256 databaseIndex = allTokensIndex[_databaseID];
        IDatabase database = databases[databaseIndex].databaseContract;
        require(database.getSafeBalance() == uint256(0));
        require(database.getPaused() == true);
        
        string memory databaseName = ERC721(database).name();
        string memory databaseSymbol = ERC721(database).symbol();
        
        delete databasesNamesIndex[databaseName];
        delete databasesSymbolsIndex[databaseSymbol];
        delete databasesIDsByAddressesIndex[database];  
        delete databasesIDsBySymbolIndex[databaseSymbol];
        delete databasesSymbolsByIDIndex[_databaseID];

        uint256 lastDatabaseIndex = databases.length.sub(1);
        DatabaseMeta memory lastDatabase = databases[lastDatabaseIndex];
        databases[databaseIndex] = lastDatabase;
        delete databases[lastDatabaseIndex];
        databases.length--;

        super._burn(msg.sender, _databaseID);
        database.transferOwnership(msg.sender);
        
        emit DatabaseDeleted(
            databaseName,
            database,
            msg.sender,
            _databaseID
        );
    }

    function fundDatabase(uint256 _databaseID)
        external
        whenNotPaused
        payable
    {
        require(exists(_databaseID) == true);
        uint256 databaseIndex = allTokensIndex[_databaseID];

        uint256 currentWei = databases[databaseIndex].currentWei.add(msg.value);
        databases[databaseIndex].currentWei = currentWei;

        uint256 accumulatedWei = databases[databaseIndex].accumulatedWei.add(msg.value);
        databases[databaseIndex].accumulatedWei = accumulatedWei;

        emit DatabaseFunded(_databaseID, msg.sender, msg.value);
        address(chaingearSafe).transfer(msg.value);
    }

    function claimDatabaseFunds(uint256 _databaseID, uint256 _amount)
        external
        onlyOwnerOf(_databaseID)
        whenNotPaused
    {
        uint256 databaseIndex = allTokensIndex[_databaseID];

        uint256 currentWei = databases[databaseIndex].currentWei;
        require(_amount <= currentWei);

        databases[databaseIndex].currentWei = currentWei.sub(_amount);

        emit DatabaseFundsClaimed(_databaseID, msg.sender, _amount);
        chaingearSafe.claim(msg.sender, _amount);
    }

    function updateCreationFee(uint256 _newFee)
        external
        onlyOwner
        whenPaused
    {
        databaseCreationFeeWei = _newFee;
        emit CreationFeeUpdated(_newFee);
    }

    /*
    *  Views
    */

    function getAmountOfBuilders()
        external
        view
        returns(uint256)
    {
        return amountOfBuilders;
    }

    function getBuilderByID(uint256 _id)
        external
        view
        returns(string)
    {
        return buildersVersionIndex[_id];
    }

    function getDatabaseBuilder(string _version)
        external
        view
        returns (
            address,
            string,
            string,
            bool
        )
    {
        return(
            buildersVersion[_version].builderAddress,
            buildersVersion[_version].linkToABI,
            buildersVersion[_version].description,
            buildersVersion[_version].operational
        );
    }

    function getDatabasesIDs()
        external
        view
        returns(uint256[])
    {
        return allTokens;
    }

    function getDatabaseIDByAddress(address _databaseAddress)
        external
        view
        returns(uint256)
    {
        uint256 databaseID = databasesIDsByAddressesIndex[_databaseAddress];
        return databaseID;
    }
    
    function getDatabaseAddressByName(string _name)
        external
        view
        returns(address)
    {
        return databasesAddressesByNameIndex[_name];
    }

    function getDatabaseSymbolByID(uint256 _databaseID)
        external
        view
        returns(string)
    {
        return databasesSymbolsByIDIndex[_databaseID];
    }

    function getDatabaseIDBySymbol(string _symbol)
        external
        view
        returns(uint256)
    {
        return databasesIDsBySymbolIndex[_symbol];
    }

    function getDatabase(uint256 _databaseID)
        external
        view
        returns (
            string,
            string,
            address,
            string,
            uint256,
            address,
            uint256
        )
    {
        uint256 databaseIndex = allTokensIndex[_databaseID];
        IDatabase databaseAddress = databases[databaseIndex].databaseContract;

        return (
            ERC721(databaseAddress).name(),
            ERC721(databaseAddress).symbol(),
            databaseAddress,
            databases[databaseIndex].versionOfDatabase,
            databases[databaseIndex].createdTimestamp,
            databaseAddress.getAdmin(),
            ERC721(databaseAddress).totalSupply()
        );
    }

    function getDatabaseBalance(uint256 _databaseID)
        external
        view
        returns (uint256, uint256)
    {
        uint256 databaseIndex = allTokensIndex[_databaseID];

        return (
            databases[databaseIndex].currentWei,
            databases[databaseIndex].accumulatedWei
        );
    }

    function getChaingearDescription()
        external
        pure
        returns (string)
    {
        return CHAINGEAR_DESCRIPTION;
    }

    function getCreationFeeWei()
        external
        view
        returns (uint256)
    {
        return databaseCreationFeeWei;
    }

    function getSafeBalance()
        external
        view
        returns (uint256)
    {
        return address(chaingearSafe).balance;
    }

    function getSafeAddress()
        external
        view
        returns (address)
    {
        return chaingearSafe;
    }

    function getNameExist(string _name)
        external
        view
        returns (bool)
    {
        return databasesNamesIndex[_name];
    }

    function getSymbolExist(string _symbol)
        external
        view
        returns (bool)
    {
        return databasesSymbolsIndex[_symbol];
    }

    /*
    *  Public functions
    */

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        whenNotPaused
    {
        uint256 databaseIndex = allTokensIndex[_tokenId];
        IDatabase database = databases[databaseIndex].databaseContract;
        require(address(database).balance == 0);
        require(database.getPaused() == true);
        super.transferFrom(_from, _to, _tokenId);
        
        IDatabase databaseAddress = databases[databaseIndex].databaseContract;
        databaseAddress.deletePayees();
        databaseAddress.transferAdminRights(_to);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        whenNotPaused
    {
        safeTransferFrom(
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

    /*
    *  Private functions
    */

    function _deployDatabase(
        string    _version,
        address[] _beneficiaries,
        uint256[] _shares,
        string    _name,
        string    _symbol
    )
        private
        returns (address, uint256)
    {
        IDatabaseBuilder builder = buildersVersion[_version].builderAddress;
        IDatabase databaseContract = builder.deployDatabase(
            _beneficiaries,
            _shares,
            _name,
            _symbol
        );

        address databaseAddress = address(databaseContract);

        SupportsInterfaceWithLookup support = SupportsInterfaceWithLookup(databaseAddress);
        require(support.supportsInterface(INTERFACE_DATABASE_V1_EULER_ID));
        require(support.supportsInterface(InterfaceId_ERC721));
        require(support.supportsInterface(InterfaceId_ERC721Metadata));
        require(support.supportsInterface(InterfaceId_ERC721Enumerable));

        DatabaseMeta memory database = (DatabaseMeta(
        {
            databaseContract: databaseContract,
            creatorOfDatabase: msg.sender,
            versionOfDatabase: _version,
            linkABI: buildersVersion[_version].linkToABI,
            createdTimestamp: block.timestamp,
            currentWei: 0,
            accumulatedWei: 0
        }));

        databases.push(database);

        databasesNamesIndex[_name] = true;
        databasesSymbolsIndex[_symbol] = true;

        uint256 newTokenID = headTokenID;
        databasesIDsByAddressesIndex[databaseAddress] = newTokenID;
        super._mint(msg.sender, newTokenID);
        databasesSymbolsByIDIndex[newTokenID] = _symbol;
        databasesIDsBySymbolIndex[_symbol] = newTokenID;
        databasesAddressesByNameIndex[_name] = databaseAddress;
        headTokenID = headTokenID.add(1);

        emit DatabaseCreated(
            _name,
            databaseAddress,
            msg.sender,
            newTokenID
        );

        databaseContract.transferAdminRights(msg.sender);
        return (databaseAddress, newTokenID);
    }

}
