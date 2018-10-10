pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../common/IRegistryBuilder.sol";
import "../common/IRegistry.sol";
import "../common/Safe.sol";


/**
* @title Chaingear - the most expensive database
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Main metaregistry contract 
* @notice Proof-of-Concept. Chaingear it's a metaregistry/fabric for Creator Curated Registries
* @notice where each registry are ERC721.
* @notice not recommend to use before release!
*/
contract Chaingear is SupportsInterfaceWithLookup, Pausable, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    // @dev Sctruct which describes registry metainformation and balance state and status
    struct RegistryMeta {
        IRegistry contractAddress;
        address   creator;
        string    version;
        string    linkABI;
        uint      registrationTimestamp;
        uint256   currentWei;
        uint256   accumulatedWei;
    }
    
    // @dev Sctruct which describes RegistryBuilder, includes IPFS links to registry ABI
    struct RegistryBuilder {
        IRegistryBuilder builderAddress;
        string           linkToABI;
        string           description;
    }
    
    RegistryMeta[] internal registries;
    // @dev ID can only increase, globally, deletion don't trigger this pointer decreasing
    uint256 internal headTokenID;
    // @dev Mapping which allow control of registries symbols uniqueness in metaregistry
    mapping(string => bool) internal registrySymbolsIndex;
    
    mapping (string => RegistryBuilder) internal buildersVersion;
    
    Safe internal chaingearSafe;

    string internal chaingearDescription;
    
    uint256 internal registryRegistrationFeeWei;
    
    // @dev Interfaces which newly created Registry should support
    bytes4 internal constant InterfaceId_ChaingearRegistry = 0x52dddfe4; 
    
    /*
    *  Events
    */

    event RegistryRegistered(
        string  name,
        address registryAddress,
        address creator,
        uint256 registryID
    );

    event RegistryUnregistered(
        address admin,
        string  symbol
    );

    event RegistryFunded(
        uint    registryID,
        address sender,
        uint256 amount
    );
    
    event RegistryFundsClaimed(
        uint    registryID,
        address claimer,
        uint256 amount
    );

    /*
    *  Constructor
    */

	/**
	* @dev Chaingear constructor
    * @param _chaingearName string chaingear's name, uses for chaingear's ERC721
    * @param _chaingearSymbol string chaingear's NFT symbol, uses for chaingear's ERC721
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _description string description of Chaingear
	* @param _registrationFee uint fee for registry creation, in wei
    * @notice Only chaingear contract as owner can trigger eithers transfer to/out from Safe
	*/
    constructor(
        string      _chaingearName,
        string      _chaingearSymbol,
        address[]   _benefitiaries,
        uint256[]   _shares,
        string      _description,
        uint        _registrationFee
    )
        public
        ERC721Token     (_chaingearName, _chaingearSymbol)
        SplitPayment    (_benefitiaries, _shares)
    {
        registryRegistrationFeeWei = _registrationFee;
        chaingearDescription = _description;
        chaingearSafe = new Safe();
        headTokenID = 0;
    }
    
    function() external payable {}
    
    modifier onlyOwnerOf(uint256 _registryID){
        require(ownerOf(_registryID) == msg.sender);
        _;
    }
    
    /*
    *  External functions
    */
    
    /**
    * @dev Provides funcitonality for adding builders of different kind of registries
    * @param _version string which represents name of registry type/version
    * @param _builderAddress IRegistryBuilder address of registry builder/fabric
    * @param _linkToABI string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about registry fabric type
    * @notice Only owner of metaregistry/chaingear allowed to add builders
    */
    function addRegistryBuilderVersion(
        string                   _version, 
        IRegistryBuilder _builderAddress,
        string                   _linkToABI,
        string                   _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(buildersVersion[_version].builderAddress == address(0));
        
        buildersVersion[_version] = (RegistryBuilder(
        {
            builderAddress: _builderAddress,
            linkToABI:      _linkToABI,
            description:    _description
        }));
    }

    /**
    * @dev Add and tokenize registry with specified parameters.
	* @dev Registration fee is required to send with tx.
	* @dev Tx sender become Creator/Admin of Registry, Chaingear become Owner of Registry
    * @param _version version of registry from which Registry will be boostrapped
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares by benefitiary
    * @param _name string, Registry name, use for registry ERC721
    * @param _symbol string, Registry NFT symbol, use for registry ERC721
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, ERC721 NFT ID
    */
    function registerRegistry(
        string      _version,
        address[]   _benefitiaries,
        uint256[]   _shares,
        string      _name,
        string      _symbol
    )
        external
        payable
        whenNotPaused
        returns (address, uint256)
    {
        require(buildersVersion[_version].builderAddress != address(0));
        require(registryRegistrationFeeWei == msg.value);
        require(registrySymbolsIndex[_symbol] == false);

        return createRegistry(
            _version,
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
    }
    
    /**
    * @dev Allows to unregister Registry from Chaingear
    * @dev Only possible when safe of Registry is empty
    * @dev Burns associated registry token and transfer Registry adminship to current token owner
    * @param _registryID uint256 Registry-token ID
    */
    function unregisterRegistry(uint256 _registryID)
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {        
        uint256 registryIndex = allTokensIndex[_registryID];
        IRegistry registry = registries[registryIndex].contractAddress;
        
        string memory registrySymbol = ERC721(registry).symbol();
        registrySymbolsIndex[registrySymbol] = false;
        
        require(registry.getSafeBalance() == 0);

        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta memory lastRegistry = registries[lastRegistryIndex];
        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        super._burn(msg.sender, _registryID);
        emit RegistryUnregistered(msg.sender, registrySymbol);
        //Sets current admin as owner of registry, transfers full control
        registry.transferOwnership(msg.sender);
    }
    
    /**
    * @dev Gets funding and allocate funds of Registry to Chaingear's Safe
    * @param _registryID uint256 Registry-token ID
    */
    function fundRegistry(uint256 _registryID)
        external
        whenNotPaused
        payable
    {
        require(exists(_registryID) == true);
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentWei.add(msg.value);
        registries[registryIndex].currentWei = currentWei;
        
        uint256 accumulatedWei = registries[registryIndex].accumulatedWei.add(msg.value);
        registries[registryIndex].accumulatedWei = accumulatedWei;

        emit RegistryFunded(_registryID, msg.sender, msg.value);
        address(chaingearSafe).transfer(msg.value);
    }

    /**
    * @dev Gets funding and allocate funds of Registry to Safe
    * @param _registryID uint256 Registry-token ID
    * @param _amount uint256 Amount which admin of registry claims
    */
    function claimEntryFunds(uint256 _registryID, uint256 _amount)
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentWei;
        require(_amount <= currentWei);
        
        registries[registryIndex].currentWei = currentWei.sub(_amount);

        emit RegistryFundsClaimed(_registryID, msg.sender, _amount);
        chaingearSafe.claim(msg.sender, _amount);
    }
    
    // @notice whenPaused against front-running
    function updateRegistrationFee(uint256 _newFee)
        external
        onlyOwner
        whenPaused
    {
        registryRegistrationFeeWei = _newFee;
    }

    function updateDescription(string _description)
        external
        onlyOwner
        whenNotPaused
    {
        uint len = bytes(_description).length;
        require(len <= 256);

        chaingearDescription = _description;
    }
    
    /**
    * @dev Allows get information about given version of registry builder and registry
    * @param _version String which represents name of given registry type
    * @return address of registry fabric for this version
    * @return string which represents IPFS hash to JSON with ABI of registry 
    * @return string which represents info about this registry 
    */
    function getRegistryBuilder(string _version) 
        external
        view
        returns (
            address,
            string,
            string
        )
    {
        return(
            buildersVersion[_version].builderAddress,
            buildersVersion[_version].linkToABI,
            buildersVersion[_version].description
        );
    }
    
    /**
    * @dev Registy metainfo getter
    * @param _registryID uint256 Registry ID, associated ERC721 token ID
    * @return string Registy name
    * @return string Registy symbol
    * @return address Registy address
    * @return address Registy creator address
    * @return string Registy version
    * @return uint Registy creation timestamp
    * @return address Registy admin address
    */
    function readRegistry(uint256 _registryID)
        external
        view
        returns (
            string,
            string,
            address,
            // address,
            string,
            uint256,
            address,
            uint256
        )
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        IRegistry contractAddress = registries[registryIndex].contractAddress;
        
        return (
            ERC721(contractAddress).name(),
            ERC721(contractAddress).symbol(),
            contractAddress,
            // registries[registryIndex].creator,
            registries[registryIndex].version,
            registries[registryIndex].registrationTimestamp,
            contractAddress.getAdmin(),
            ERC721(contractAddress).totalSupply()
        );
    }

    /**
    * @dev Registy funding stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy current balance in wei, which stored in Safe
    * @return uint Registy total accumulated balance in wei
    */
    function readRegistryBalance(uint256 _registryID)
        external
        view
        returns (uint256, uint256)
    {
        require(exists(_registryID) == true);
        uint256 registryIndex = allTokensIndex[_registryID];
        
        return (
            registries[registryIndex].currentWei,
            registries[registryIndex].accumulatedWei
        );
    }
    
    function getRegistriesIDs()
        external
        view
        returns (uint256[])
    {
        return allTokens;
    }
    
    function getDescription()
        external
        view
        returns (string)
    {
        return chaingearDescription;
    }

    function getRegistrationFee()
        external
        view
        returns (uint256)
    {
        return registryRegistrationFeeWei;
    }
    
    function getSafeBalance()
        external
        view
        returns (uint256)
    {
        return address(chaingearSafe).balance;
    }
    
    function getSafe()
        external
        view
        returns (address)
    {
        return chaingearSafe;
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
        super.transferFrom(_from, _to, _tokenId);
        
        uint256 registryIndex = allTokensIndex[_tokenId];
        IRegistry registryAddress = registries[registryIndex].contractAddress;
        registryAddress.transferAdminRights(_to);
    }  
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        whenNotPaused
    {
        super.safeTransferFrom(_from, _to, _tokenId, "");
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
        /* solium-disable-next-line indentation*/
        require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data));
    }

    /*
    *  Private functions
    */

    /**
    * @dev Private function for registry creation
    * @dev Pass Registry params to RegistryCreator with specified Registry Version
    * @param _version version of registry code which added to chaingear
    * @param _benefitiaries address[] addresses of Registry benefitiaries
    * @param _shares uint256[] array with amount of shares to benefitiaries
    * @param _name string, Registry name, use for registry ERC721
    * @param _symbol string, Registry NFT symbol, use for registry ERC721
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, ERC721 NFT ID
    * @notice Chaingear sets themself as owner of Registry, creators sets to admin
    */
    function createRegistry(
        string      _version,
        address[]   _benefitiaries,
        uint256[]   _shares,
        string      _name,
        string      _symbol
    )
        private
        returns (address, uint256)
    {   
        IRegistryBuilder builder = buildersVersion[_version].builderAddress;
        IRegistry registryContract = builder.deployRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        address registryAddress = address(registryContract);
        SupportsInterfaceWithLookup support = SupportsInterfaceWithLookup(registryAddress);
        
        require(support.supportsInterface(InterfaceId_ChaingearRegistry));
        require(support.supportsInterface(InterfaceId_ERC721));
        require(support.supportsInterface(InterfaceId_ERC721Metadata));
        require(support.supportsInterface(InterfaceId_ERC721Enumerable));
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            contractAddress:        registryContract,
            creator:                msg.sender,
            version:                _version,
            linkABI:                buildersVersion[_version].linkToABI,
            /* solium-disable-next-line security/no-block-members */
            registrationTimestamp:  block.timestamp,
            currentWei:             0,
            accumulatedWei:         0
        }));

        registries.push(registry);
        registrySymbolsIndex[_symbol] = true;
        
        uint256 newTokenID = headTokenID;
        headTokenID = headTokenID.add(1);
        
        super._mint(msg.sender, newTokenID);
        
        emit RegistryRegistered(
            _name,
            registryAddress,
            msg.sender,
            newTokenID
        );    
        
        registryContract.transferAdminRights(msg.sender);

        return (registryAddress, newTokenID);
    }
    
}
