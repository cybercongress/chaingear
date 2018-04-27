pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../common/IPFSeable.sol";
import "./RegistryCreator.sol";
import "./RegistryBase.sol";


contract ChaingearCore is RegistryBase, IPFSeable, Destructible, Pausable {

	/*
	*  Storage
	*/
    
    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription_;
    
    // @dev 
    uint internal registryRegistrationFee_;
    
    // @dev
    RegistryCreator internal creator_;

	/*
	*  External Functions
	*/

    
    function updateRegistrationFee(
        uint _newFee
    )
        external
        onlyOwner
    {
        registryRegistrationFee_ = _newFee;
    }

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

    function chaingearDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription_;
    }

    function registryRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee_;
    }

    function registryCreator()
        public
        view
        returns (address)
    {
        return creator_;
    }
    
}
