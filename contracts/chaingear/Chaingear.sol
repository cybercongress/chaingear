pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "../common/SplitPaymentChangeable.sol";
import "../common/RegistryBasic.sol";
import "./ChaingearCore.sol";
import "./RegistryCreator.sol";


/**
* @title Chaingear - the most expensive Regisrty
* @author cyber•Congress
* @dev Main metaregistry contract 
* @notice not recommend to use before release!
*/
contract Chaingear is ERC721Token, SplitPaymentChangeable, ChaingearCore {

	/*
	*  Modifiers
	*/
    
    /**
    * @dev modifier for checking ownership of Registry associated token
    * @param _registryID uint256 token-registry ID
    */
    modifier onlyRegistryAdmin(uint256 _registryID) {
        require (ownerOf(_registryID) == msg.sender);
        _;
    }
    
    /*
    *  Constructor
    */

	/**
	* @dev Chaingear constructor, pre-deployment of Chaingear
	* @param _creator RegistryCreator address of RegistryCreator contract
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares
	* @param _description string description of Chaingear
	* @param _registrationFee uint Registration fee for registry creation
	* @param _chaingearName string Chaingear name
	* @param _chaingearSymbol string Chaingear symbol
	*/
    function Chaingear(
        address _creator,
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        uint _registrationFee,
        string _chaingearName,
        string _chaingearSymbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_chaingearName, _chaingearSymbol)
        public
        payable
    {
        registryRegistrationFee_ = _registrationFee;
        chaingearDescription_ = _description;
        creator_ = _creator;
    }
    
    /*
    *  Public functions
    */

    /**
    * @dev Add and tokenize registry with specified parameters to Chaingear.
	* @dev Registration fee is required to send with tx.
	* @dev Tx sender become Creator of Registry, chaingear become Owner of Registry
    * @param _name string, Registry name
    * @param _symbol string, Registry symbol
    * @param _linkToABIOfEntriesContract string, link to ABI of EntryCore contract
    * @param _bytecodeOfEntriesContract bytes, bytecode of user generated EntryCore contract
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, same token ID
    */
    function registerRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        public
        payable
        whenNotPaused
        returns (address registryAddress, uint256 registryID)
    {
        require(msg.value == registryRegistrationFee_);

        return createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
    }
    
    /**
    * @dev Allows transfer ownership of Registry to new owner
    * @dev Transfer associated token and set owner of registry to new owner
    * @param _registryID uint256 Registry-token ID
    * @param _newOwner address Address of new owner
    */
    function updateRegistryOwnership(
        uint256 _registryID,
        address _newOwner
    )
        public
        whenNotPaused
        onlyRegistryAdmin(_registryID)
    {
        RegistryBasic(registries[_registryID].contractAddress).transferTokenizedOnwerhip(_newOwner);
        registries[_registryID].owner = _newOwner;

        super.removeTokenFrom(msg.sender, _registryID);
        super.addTokenTo(_newOwner, _registryID);

        emit RegistryTransferred(msg.sender, registries[_registryID].name, _registryID, _newOwner);
    }
    
    /**
    * @dev Allows to unregister created Registry from Chaingear
    * @dev Only possible when safe of Registry is empty
    * @dev Burns associated registry token and transfer Registry ownership to creator
    * @param _registryID uint256 Registry-token ID
    */
    function unregisterRegistry(uint256 _registryID)
        public
        whenNotPaused
        onlyRegistryAdmin(_registryID)
    {        
        address registryAddress = registries[_registryID].contractAddress;
        require(RegistryBasic(registryAddress).safeBalance() == 0);
        /* require(Registry(registryAddress).entriesAmount() == 0); */
        
        uint256 registryIndex = allTokensIndex[_registryID];
        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta storage lastRegistry = registries[lastRegistryIndex];

        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;
        
        RegistryBasic(registryAddress).transferOwnership(registries[_registryID].owner);

        super._burn(msg.sender, _registryID);
        
        string storage registryName = registries[_registryID].name;
        emit RegistryUnregistered(msg.sender, registryName);
    }
    
    /**
    * @dev Allows set and update ABI link for generated and created Registry
    * @dev Only Registry associated token owner can update
    * @param _registryID uint256 Registry-token ID
    * @param _link string IPFS hash to json with ABI
    */
    function setABILinkForRegistry(
        uint256 _registryID, 
        string _link
    )
        public
        whenNotPaused
        onlyRegistryAdmin(_registryID)
    {
        registries[_registryID].linkABI = _link;
    }
    
    /*
    *  Private functions
    */
    
    /**
    * @dev Private function for registry creation
    * @dev Pass Registry params and bytecode to RegistryCreator to current builder
    * @param _benefitiaries address[]
    * @param _shares uint256[]
    * @param _name string
    * @param _symbol string
    * @param _linkToABIOfEntriesContract string
    * @param _bytecodeOfEntriesContract bytes
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, same token ID
    */
    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        private
        returns (
            address newRegistryContract, 
            uint256 newRegistryID
        )
    {
        address registryContract = RegistryCreator(creator_).create(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
        RegistryBasic(registryContract).transferOwnership(msg.sender);

        RegistryMeta memory registry = (RegistryMeta(
        {
            name: _name,
            contractAddress: registryContract,
            creator: msg.sender,
            linkABI: _linkToABIOfEntriesContract,
            registrationTimestamp: block.timestamp,
            owner: msg.sender,
            currentRegistryBalanceETH: 0,
            accumulatedRegistryETH: 0
        }));
        
        uint256 registryID = registries.push(registry) - 1;
        _mint(msg.sender, registryID);
        emit RegistryRegistered(_name, registryContract, msg.sender, registryID);

        return (
            registryContract, 
            registryID
        );
    }
    
}
