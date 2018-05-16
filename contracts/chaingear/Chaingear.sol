pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "../common/RegistryBasic.sol";
/* import "../common/RegistrySafe.sol"; */
import "./ChaingearCore.sol";

// TODO: move out
import "./RegistryCreator.sol";


/**
* @title Chaingear - the most expensive Regisrty
* @author cyber•Congress
* @dev Main metaregistry contract 
* @notice not recommend to use before release!
*/
contract Chaingear is ERC721Token, SplitPaymentChangeable, ChaingearCore {

    using SafeMath for uint256;

	/*
	*  Modifiers
	*/

    // TODO change to inner ERC721 modifier
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
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares
	* @param _description string description of Chaingear
	* @param _registrationFee uint Registration fee for registry creation
	* @param _chaingearName string Chaingear name
	* @param _chaingearSymbol string Chaingear symbol
	*/
    constructor(
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
        
        // TODO out of gas
        /* registrySafe_ = new RegistrySafe(); */
    }
    
    /* function addSafe()
        external
        onlyOwner
    {
        registrySafe_ = new RegistrySafe();
    } */
    
    /*
    *  Public functions
    */

    /**
    * @dev Add and tokenize registry with specified parameters to Chaingear.
	* @dev Registration fee is required to send with tx.
	* @dev Tx sender become Creator of Registry, chaingear become Owner of Registry
    * @param _version version of registry code which added to chaingear
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares
    * @param _name string, Registry name
    * @param _symbol string, Registry symbol
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, same token ID
    */
    function registerRegistry(
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        public
        payable
        whenNotPaused
        returns (
            address registryAddress,
            uint256 registryID
        )
    {
        require(registryCreatorsAddresses[_version] != 0x0);
        require(msg.value == registryRegistrationFee_);
        // TODO check for uniqueness for registry name and symbol

        return createRegistry(
            _version,
            _benefitiaries,
            _shares,
            _name,
            _symbol
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
    * @param _version version of registry code which added to chaingear
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares
    * @param _name string, Registry name
    * @param _symbol string, Registry symbol
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, same token ID
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
            address newRegistryContract,
            uint256 newRegistryID
        )
    {
        // TODO assembly call
        address registryContract = RegistryCreator(registryCreatorsAddresses[_version]).create(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        // sets in Adminable constructor.. need to audit and test
        /* RegistryBasic(registryContract).transferTokenizedOnwerhip(msg.sender); */
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            name: _name,
            contractAddress: registryContract,
            creator: msg.sender,
            version: _version,
            linkABI: "",
            registrationTimestamp: block.timestamp,
            owner: msg.sender
            /* currentRegistryBalanceETH: 0,
            accumulatedRegistryETH: 0 */
        }));

        uint256 registryID = registries.push(registry) - 1;
        _mint(msg.sender, registryID);
        emit RegistryRegistered(_name, registryContract, msg.sender, registryID);

        return (
            registryContract,
            registryID
        );
    }
    
    /*
    *  TODO
    */
    
    
    /* function fundRegistry(uint256 _registryID)
        public
        whenNotPaused
        payable
    {
        registries[_registryID].currentRegistryBalanceETH.add(msg.value);
        registries[_registryID].accumulatedRegistryETH.add(msg.value);
        registrySafe_.transfer(msg.value);

        emit registryFunded(_registryID, msg.sender);
    }

    function claimEntryFunds(uint256 _registryID, uint _amount)
        public
        whenNotPaused
        onlyRegistryAdmin(_registryID)
    {
        require(_amount <= registries[_amount].currentRegistryBalanceETH);
        registries[_registryID].currentRegistryBalanceETH.sub(_amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        emit registryFundsClaimed(_registryID, msg.sender, _amount);
    } */
    
}
