pragma solidity 0.4.23;

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
    
    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription_;
    
    // @dev Amount that Creator should pay for registry creation
    // @notice In Wei
    uint internal registryRegistrationFee_;
    
    mapping (string => address) internal registryCreatorsAddresses;
    mapping (string => string) internal registryCreatorsABIsLinks;
    mapping (string => string) internal registryCreatorsDescriptions;


    function addRegistryCreatorVersion(
        string _nameOfVerions, 
        address _addressRegistryCreator,
        string _link,
        string _description
    )
        public
        onlyOwner
    {
        registryCreatorsAddresses[_nameOfVerions] = _addressRegistryCreator;
        registryCreatorsABIsLinks[_nameOfVerions] = _link;
        registryCreatorsDescriptions[_nameOfVerions] = _description;
    }
    
    function getRegistryCreatorInfo(string _version) 
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
        registryRegistrationFee_ = _newFee;
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

        chaingearDescription_ = _description;
    }

	/*
	*  View Functions
	*/

    /**
    * @dev Chaingear' description getter
    * @return string description of Chaingear
    */
    function chaingearDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription_;
    }

    /**
    * @dev Chaingear' registration fee getter
    * @return uint amount of fee in wei
    */
    function registryRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee_;
    }
    
}
