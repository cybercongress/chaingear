pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./RegistryBase.sol";


/**
* @title Chaingear core contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Storage of core data and setters/getters
* @notice not recommend to use before release!
*/

contract ChaingearCore is RegistryBase, Destructible, Pausable {

	/*
	*  Storage
	*/
    
    // @dev Mapping which allow control of name uniqueness in metaregistry
    mapping(string => bool) internal registryNamesIndex;
    
    // @dev Mapping which allow control of symbol uniqueness in metaregistry
    mapping(string => bool) internal registrySymbolsIndex;

    // @dev Short Chaingear's description, less than 128 symbols
    string internal chaingearDescription;
    
    // @dev Amount that registrys creator should pay for registry creation/registring
    uint internal registryRegistrationFee;
    
    // @dev Address of contract where their funds allocates
    address internal chaingearSafe;
    
    // @dev mapping with address of registry creators with different code base of registries
    mapping (string => address) internal registryAddresses;
    
    // @dev mapping with ipfs links to json with ABI of different registries
    mapping (string => string) internal registryABIsLinks;
    
    // @dev mapping description of different registries types/versions
    mapping (string => string) internal registryDescriptions;

    /*
    *  Events
    */

    // @dev Signals that given Registry funded
    event RegistryFunded(
        uint registryID,
        address sender,
        uint amount
    );
    
    // @dev Signals that given Registry funds claimed by their admin
    event RegistryFundsClaimed(
        uint registryID,
        address claimer,
        uint amout
    );
    
    /*
    *  External Functions
    */

    /**
    * @dev Provides funcitonality for adding fabrics of different kind of registries
    * @param _nameOfVersion string which represents name of registry type/version
    * @param _addressRegistryCreator address of registry creator/fabric
    * @param _link string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about registry fabric type
    * @notice Only owner of metaregistry/chaingear allowed to add fabrics
    */
    function addRegistryCreatorVersion(
        string _nameOfVersion, 
        address _addressRegistryCreator,
        string _link,
        string _description
    )
        external
        onlyOwner
    {
        require(registryAddresses[_nameOfVersion] == 0x0);
        registryAddresses[_nameOfVersion] = _addressRegistryCreator;
        registryABIsLinks[_nameOfVersion] = _link;
        registryDescriptions[_nameOfVersion] = _description;
    }

	/*
	*  External Functions
	*/

    /**
    * @dev Chaingear' registry creation/registration fee setter
    * @param _newFee uint new fee amount
    * @notice Only owner of metaregistry/chaingear allowed to set fee
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
    * @param _description string with new description
    * @notice description should be less than 128 symbols
    * @notice Only owner of metaregistry/chaingear allowed to change description
    */
    function updateDescription(
        string _description
    )
        external
        onlyOwner
    {
        uint len = bytes(_description).length;
        require(len <= 256);

        chaingearDescription = _description;
    }

	/*
	*  View Functions
	*/
    
    /**
    * @dev Allows get information about given version of registry fabric
    * @param _nameOfVersion address which represents name of registry type
    * @return _addressRegistryCreator address of registry fabric for this version
    * @return _link string which represents IPFS hash to JSON with ABI of registry 
    * @return _description string which resprent info about this registry 
    */
    function getRegistryCreatorInfo(
        string _nameOfVersion
    ) 
        external
        view
        returns (
            address _addressRegistryCreator,
            string _link,
            string _description
        )
    {
        return(
            registryAddresses[_nameOfVersion],
            registryABIsLinks[_nameOfVersion],
            registryDescriptions[_nameOfVersion]
        );
    }

    /**
    * @dev Chaingear description getter
    * @return string description of Chaingear
    */
    function getDescription()
        external
        view
        returns (string)
    {
        return chaingearDescription;
    }

    /**
    * @dev Chaingear registration fee getter
    * @return uint amount of fee in wei
    */
    function getRegistrationFee()
        external
        view
        returns (uint)
    {
        return registryRegistrationFee;
    }
    
    /**
    * @dev Safe balence getter
    * @return uint amount of fee in wei
    */
    function getSafeBalance()
        external
        view
        returns (uint)
    {
        return address(chaingearSafe).balance;
    }
    
    /**
    * @dev Safe contract address getter
    * @return uint amount of fee in wei
    */
    function getSafe()
        external
        view
        returns (address)
    {
        return chaingearSafe;
    }
}
