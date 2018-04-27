pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../common/IPFSeable.sol";
import "./RegistryCreator.sol";
import "./RegistryBase.sol";


/**
* @title Chaingear core contract
* @author cyber•Congress
* @dev Storage of core params with setters, getters
* @notice not recommend to use before release!
*/
contract ChaingearCore is RegistryBase, IPFSeable, Destructible, Pausable {

	/*
	*  Storage
	*/
    
    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription_;
    
    // @dev Amount that Creator should pay for registry creation
    // @notice In Wei
    uint internal registryRegistrationFee_;
    
    // @dev Address of RegistryCreator contract
    RegistryCreator internal creator_;

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

    /**
    * @dev Chaingear' RegistryCreator setter
    * @param _creator RegistryCreator address
    */
    function setRegistryCreator(
        RegistryCreator _creator
    )
        external
        onlyOwner
    {
        creator_ = _creator;
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

    /**
    * @dev Current RegistryCreator contract address getter
    * @return address of current RegistryCreator contract
    */
    function registryCreator()
        public
        view
        returns (address)
    {
        return creator_;
    }
    
}
