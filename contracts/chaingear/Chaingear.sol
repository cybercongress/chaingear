pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/RegistryInterface.sol";
import "./ChaingearCore.sol";


/**
* @title Chaingear - the most expensive database
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Main metaregistry contract 
* @notice Proof-of-Concept. Chaingear it's a metaregistry/fabric for Creator Curated Registries
* @notice where each registry are ERC721.
* @notice not recommend to use before release!
*/
contract Chaingear is ChaingearCore, SupportsInterfaceWithLookup, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    // @dev Sctruct which describes registry metainformation and balance state and status
    struct RegistryMeta {
        RegistryInterface contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        uint256 currentRegistryBalanceWei;
        uint256 accumulatedRegistryWei;
    }
    
    RegistryMeta[] internal registries;
    // @dev ID can only increase, globally, deletion don't trigger this pointer decreasing
    uint256 internal headTokenID;
    // @dev Mapping which allow control of registries symbols uniqueness in metaregistry
    mapping(string => bool) internal registrySymbolsIndex;
    
    // @dev Interfaces which newly created Registry should support
    bytes4 internal constant InterfaceId_Registry = 0x52dddfe4;
    bytes4 internal constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 internal constant InterfaceId_ERC721Metadata = 0x5b5e139f;
    bytes4 internal constant InterfaceId_ERC721Enumerable = 0x780e9d63;
    
    /*
    *  Events
    */

    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint256 registryID
    );

    event RegistryUnregistered(
        address admin,
        string symbol
    );

    event RegistryFunded(
        uint registryID,
        address sender,
        uint amount
    );
    
    event RegistryFundsClaimed(
        uint registryID,
        address claimer,
        uint amout
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
        string _chaingearName,
        string _chaingearSymbol,
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        uint _registrationFee
    )
        public
        ERC721Token(_chaingearName, _chaingearSymbol)
        SplitPayment(_benefitiaries, _shares)
    {
        registryRegistrationFee = _registrationFee;
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
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        payable
        whenNotPaused
        returns (
            address,
            uint256
        )
    {
        require(buildersVersion[_version].builderAddress != address(0));
        require(registryRegistrationFee == msg.value);
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
    function unregisterRegistry(
        uint256 _registryID
    )
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {        
        uint256 registryIndex = allTokensIndex[_registryID];
        RegistryInterface registryAddress = registries[registryIndex].contractAddress;
        
        string memory registrySymbol = registryAddress.symbol();
        registrySymbolsIndex[registrySymbol] = false;
        
        require(registryAddress.getSafeBalance() == 0);

        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta memory lastRegistry = registries[lastRegistryIndex];
        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        super._burn(msg.sender, _registryID);
        emit RegistryUnregistered(
            msg.sender,
            registrySymbol
        );    
        //Sets current admin as owner of registry, transfers full control
        registryAddress.transferOwnership(msg.sender);
    }
    
    /**
    * @dev Gets funding and allocate funds of Registry to Chaingear's Safe
    * @param _registryID uint256 Registry-token ID
    */
    function fundRegistry(
        uint256 _registryID
    )
        external
        whenNotPaused
        payable
    {
        require(exists(_registryID) == true);
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentRegistryBalanceWei.add(msg.value);
        registries[registryIndex].currentRegistryBalanceWei = currentWei;
        
        uint256 accumulatedWei = registries[registryIndex].accumulatedRegistryWei.add(msg.value);
        registries[registryIndex].accumulatedRegistryWei = accumulatedWei;

        emit RegistryFunded(
            _registryID,
            msg.sender,
            msg.value
        );
        
        address(chaingearSafe).transfer(msg.value);
    }

    /**
    * @dev Gets funding and allocate funds of Registry to Safe
    * @param _registryID uint256 Registry-token ID
    * @param _amount uint256 Amount which admin of registry claims
    */
    function claimEntryFunds(
        uint256 _registryID,
        uint256 _amount
    )
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentRegistryBalanceWei;
        require(_amount <= currentWei);
        
        registries[registryIndex].currentRegistryBalanceWei = currentWei.sub(_amount);

        emit RegistryFundsClaimed(
            _registryID,
            msg.sender,
            _amount
        );
        
        chaingearSafe.claim(
            msg.sender,
            _amount
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
    function readRegistry(
        uint256 _registryID
    )
        external
        view
        returns (
            string,
            string,
            address,
            address,
            string,
            uint,
            address
        )
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        RegistryInterface contractAddress = registries[registryIndex].contractAddress;
        
        return (
            contractAddress.name(),
            contractAddress.symbol(),
            contractAddress,
            registries[registryIndex].creator,
            registries[registryIndex].version,
            registries[registryIndex].registrationTimestamp,
            contractAddress.getAdmin()
        );
    }

    /**
    * @dev Registy funding stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy current balance in wei, which stored in Safe
    * @return uint Registy total accumulated balance in wei
    */
    function readRegistryBalance(
        uint256 _registryID
    )
        external
        view
        returns (
            uint256,
            uint256 
        )
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        
        return (
            registries[registryIndex].currentRegistryBalanceWei,
            registries[registryIndex].accumulatedRegistryWei
        );
    }
    
    function getRegistriesIDs()
        external
        view
        returns (
            uint256[]
        )
    {
        return allTokens;
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
        super.transferFrom(
            _from,
            _to,
            _tokenId
        );
        
        uint256 registryIndex = allTokensIndex[_tokenId];
        
        RegistryInterface registryAddress = registries[registryIndex].contractAddress;
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
        whenNotPaused
    {
        transferFrom(
            _from,
            _to,
            _tokenId
        );
        
        /* solium-disable-next-line indentation*/
        require(checkAndCallSafeTransfer(
            _from,
            _to,
            _tokenId,
            _data
        ));
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
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        private
        returns (
            RegistryInterface,
            uint256
        )
    {   
        RegistryBuilderInterface builder = buildersVersion[_version].builderAddress;
        RegistryInterface registryContract = builder.createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        require(registryContract.supportsInterface(InterfaceId_Registry));
        require(registryContract.supportsInterface(InterfaceId_ERC721));
        require(registryContract.supportsInterface(InterfaceId_ERC721Metadata));
        require(registryContract.supportsInterface(InterfaceId_ERC721Enumerable));
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            contractAddress: registryContract,
            creator: msg.sender,
            version: _version,
            linkABI: buildersVersion[_version].linkToABI,
            /* solium-disable-next-line security/no-block-members */
            registrationTimestamp: block.timestamp,
            currentRegistryBalanceWei: 0,
            accumulatedRegistryWei: 0
        }));

        registries.push(registry);
        registrySymbolsIndex[_symbol] = true;
        
        uint256 newTokenID = headTokenID;
        headTokenID = headTokenID.add(1);
        
        super._mint(
            msg.sender,
            newTokenID
        );
        
        emit RegistryRegistered(
            _name,
            registryContract,
            msg.sender,
            newTokenID
        );    
        
        registryContract.transferAdminRights(msg.sender);

        return (
            registryContract,
            newTokenID
        );
    }
    
}
