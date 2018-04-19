pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../common/IPFSeable.sol";
import "./RegistryCreator.sol";
import "./RegistryBase.sol";


contract ChaingearCore is RegistryBase, IPFSeable, Destructible, Pausable {

    string internal chaingearDescription_;
    uint internal registryRegistrationFee_;

    RegistryCreator internal creator_;

    function registryRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee_;
    }

    function updateRegistrationFee(uint _newFee)
        external
        onlyOwner
    {
        registryRegistrationFee_ = _newFee;
    }

    function chaingearDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription_;
    }

    function updateDescription(string _description)
        external
        onlyOwner
    {
        uint len = bytes(_description).length;
        require(len <= 128);

        chaingearDescription_ = _description;
    }

    function registryCreator()
        public
        view
        returns (address)
    {
        return creator_;
    }

    function setRegistryCreator(RegistryCreator _creator)
        external
        onlyOwner
    {
        creator_ = _creator;
    }
}
