pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../common/IPFSeable.sol";
import "./RegistryCreator.sol";
import "./RegistryBase.sol";

/**
* @title Chaingear manager
* @author cyber•Congress
* @dev not recommend to use before release!
*/
contract ChaingearCore is RegistryBase, IPFSeable, Destructible, Pausable {

	/*
	*  Storage
	*/

    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription_;

    // @dev initiate Registry registration fee in Chaingear
    uint internal registryRegistrationFee_;

    // @dev initiate Registry creator
    RegistryCreator internal creator_;

	/*
	*  External Functions
	*/

    /**
    * @dev new Chaingear fee setter
    * @param uint _newFee
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
    * @dev new Chaingear description setter
    * @param string _description
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
    * @dev new Registry creator setter, as admin of Register
    * @param RegistryCreator _creator
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
    * @dev Chaingear description getter
    * @return string chaingearDescription_
    */
    function chaingearDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription_;
    }

    /**
    * @dev Chaingear Registry' registration fee getter
    * @return uint registryRegistrationFee_
    */
    function registryRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee_;
    }

    /**
    * @dev  Registry' creator address getter
    * @return address creator_
    */
    function registryCreator()
        public
        view
        returns (address)
    {
        return creator_;
    }

}
