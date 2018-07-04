pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./RegistryBase.sol";


/**
* @title Chaingear core contract
* @author cyber•Congress
* @dev Storage of core params with setters, getters
* @notice not recommend to use before release!
*/
contract ChaingearCore is RegistryBase, Destructible, Pausable {

	/*
	*  Storage
	*/
    
    mapping(string => bool) internal registryNamesIndex;
    
    mapping(string => bool) internal registrySymbolsIndex;

    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription;
    
    // @dev Amount that Creator should pay for registry creation
    uint internal registryRegistrationFee;
    
    address internal registrySafe;
    
    // @dev mapping with address of registry creators with different code base of registries
    mapping (string => address) internal registryCreatorsAddresses;
    
    // @dev mapping with ipfs links to json with ABI of different registries
    mapping (string => string) internal registryCreatorsABIsLinks;
    
    // @dev mapping description of different registries
    mapping (string => string) internal registryCreatorsDescriptions;

    /*
    *  Events
    */

    event RegistryFunded(
        uint ID,
        address sender
    );
    
    event RegistryFundsClaimed(
        uint ID,
        address claimer,
        uint amout
    );
    
    /*
    *  Public Functions
    */

    /**
    * @dev Provides funcitonality for adding bytecode different kind of registries
    * @param _nameOfVersions string which represents name of registry type
    * @param _addressRegistryCreator address of registry creator for this version
    * @param _link string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about this registry
    */
    function addRegistryCreatorVersion(
        string _nameOfVersions, 
        address _addressRegistryCreator,
        string _link,
        string _description
    )
        public
        onlyOwner
    {
        // TODO check for uniqueness
        registryCreatorsAddresses[_nameOfVersions] = _addressRegistryCreator;
        registryCreatorsABIsLinks[_nameOfVersions] = _link;
        registryCreatorsDescriptions[_nameOfVersions] = _description;
    }

	/*
	*  External Functions
	*/

    /**
    * @dev Chaingear' registry fee setter
    * @param _newFee uint new amount of fee
    */
    function updateRegistrationFee(
        uint _newFee
    )
        external
        onlyOwner
    {
        registryRegistrationFee = _newFee;
    }

    /**
    * @dev Chaingear' description setter
    * @param _description string new description
    * @notice description should be less than 128 symbols
    */
    function updateDescription(
        string _description
    )
        external
        onlyOwner
    {
        uint len = bytes(_description).length;
        require(len <= 128);

        chaingearDescription = _description;
    }

	/*
	*  View Functions
	*/
    
    /**
    * @dev Provides funcitonality for adding bytecode different kind of registries
    * @param _version address which represents name of registry type
    * @return _addressRegistryCreator address of registry creator for this version
    * @return _link string which represents IPFS hash to JSON with ABI of registry 
    * @return _description string which resprent info about this registry
    */
    function getRegistryCreatorInfo(
        string _version
    ) 
        public
        view
        returns (
            address _addressRegistryCreator,
            string _link,
            string _description
        )
    {
        return(
            registryCreatorsAddresses[_version],
            registryCreatorsABIsLinks[_version],
            registryCreatorsDescriptions[_version]
        );
    }

    /**
    * @dev Chaingear' description getter
    * @return string description of Chaingear
    */
    function getDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription;
    }

    /**
    * @dev Chaingear' registration fee getter
    * @return uint amount of fee in wei
    */
    function getRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee;
    }
    
    function getSafeBalance()
        public
        view
        returns (uint balance)
    {
        return address(registrySafe).balance;
    }
    
    function getSafe()
        public
        view
        returns (address)
    {
        return registrySafe;
    }
}
