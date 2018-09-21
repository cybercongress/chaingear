pragma solidity ^0.4.24;

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
contract Chaingear is ChaingearCore, SplitPayment, ERC721Token {

    using SafeMath for uint256;

    /*
    *  Constructor
    */

	/**
	* @dev Chaingear constructor
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _description string description of Chaingear
	* @param _registrationFee uint Fee for registry creation, wei
	* @param _chaingearName string Chaingear's name, use for chaingear's ERC721
	* @param _chaingearSymbol string Chaingear's NFT symbol, use for chaingear's ERC721
	*/
    constructor(
        string _chaingearName,
        string _chaingearSymbol,
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        uint _registrationFee
    )
        ERC721Token(_chaingearName, _chaingearSymbol)
        SplitPayment(_benefitiaries, _shares)
        public
    {
        registryRegistrationFee = _registrationFee;
        chaingearDescription = _description;
        // Only chaingear as owner can transfer either to and out from Safe
        chaingearSafe = new Safe();
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
        require(registryCreators[_version] != address(0));
        //// [review] Withdraw funds by calling 'SplitPayment.claim'
        require(registryRegistrationFee == msg.value);
        
        //checking uniqueness of name AND symbol of NFT in metaregistry
        require(registryNamesIndex[_name] == false);
        require(registrySymbolsIndex[_symbol] == false);

        return createRegistry(
            _version,
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
    }
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        whenNotPaused
    {
        super.transferFrom(_from, _to, _tokenId);
        RegistryInterface registryAddress = registries[_tokenId].contractAddress;
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
        require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data));
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
        RegistryInterface registryAddress = registries[_registryID].contractAddress;
        //// [review] If registryAddress does not support the RegistryInterface -> can lead to VERY BAD THINGS
        require(registryAddress.getSafeBalance() == 0);

        uint256 registryIndex = allTokensIndex[_registryID];
        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta storage lastRegistry = registries[lastRegistryIndex];

        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        _burn(msg.sender, _registryID);

        string memory registryName = registryAddress.name();
        emit RegistryUnregistered(msg.sender, registryName);
        
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
        registries[_registryID].currentRegistryBalanceWei = registries[_registryID].currentRegistryBalanceWei.add(msg.value);
        registries[_registryID].accumulatedRegistryWei = registries[_registryID].accumulatedRegistryWei.add(msg.value);

        emit RegistryFunded(_registryID, msg.sender, msg.value);
        
        //// [review] Call claimEntryFunds to get funds back
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
        require(_amount <= registries[_registryID].currentRegistryBalanceWei);
        registries[_registryID].currentRegistryBalanceWei = registries[_registryID].currentRegistryBalanceWei.sub(_amount);

        emit RegistryFundsClaimed(_registryID, msg.sender, _amount);
        
        chaingearSafe.claim(msg.sender, _amount);
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
        RegistryInterface registryContract = registryCreators[_version].create(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            contractAddress: registryContract,
            creator: msg.sender,
            version: _version,
            linkABI: registryABIsLinks[_version],
            registrationTimestamp: block.timestamp,
            currentRegistryBalanceWei: 0,
            accumulatedRegistryWei: 0
        }));

        uint256 registryID = registries.push(registry) - 1;
        _mint(msg.sender, registryID);
        
        registryNamesIndex[_name] = true;
        registrySymbolsIndex[_symbol] = true;
        
        emit RegistryRegistered(_name, registryContract, msg.sender, registryID);
        
        //Metaregistry as owner sets creator as admin of Registry
        registryContract.transferAdminRights(msg.sender);

        return (
            registryContract,
            registryID
        );
    }
    
}
