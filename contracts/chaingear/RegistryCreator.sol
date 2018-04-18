pragma solidity ^0.4.19;

import "../registry/Registry.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract RegistryCreator is Ownable {

    address internal builder_;

    function RegistryCreator(address _builder)
        public
    {
        builder_ = _builder;
    }

    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        Registry.PermissionTypeEntries _permissionType,
        uint _entryCreationFee,
        string _name,
        string _symbol,
        string _description,
        // string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        external
        returns (Registry newRegistryContract)
    {
        require(msg.sender == builder_);

        /* newRegistryContract = new Registry(
            _benefitiaries,
            _shares,
            _permissionType,
            _entryCreationFee,
            _name,
            _symbol,
            _description,
            // _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
        newRegistryContract.transferOwnership(msg.sender); */
    }

    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder_ = _builder;
    }

    function registryBuilder()
        public
        view
        returns (address)
    {
        return builder_;
    }
}
