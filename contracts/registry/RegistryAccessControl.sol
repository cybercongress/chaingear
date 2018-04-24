pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract RegistryAccessControl is Ownable, Pausable, Destructible {

    address internal registryOwner_;

    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyCreator, Whitelist, AllUsers}

    modifier onlyRegistryOwner() {
        require(msg.sender == registryOwner_);
        _;
    }

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyCreator) {
            require(msg.sender == registryOwner_);
        }
        // if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
        //     require(whitelist[msg.sender] || msg.sender == registryOwner_);
        // }
        _;
    }

    function RegistryAccessControl()
        public
    {
        registryOwner_ = tx.origin;
    }

    function registryOwner()
        public
        view
        returns (address)
    {
        return registryOwner_;
    }

    function permissionsTypeEntries()
        public
        view
        returns (PermissionTypeEntries)
    {
        return permissionTypeEntries_;
    }

    function updatePermissionTypeEntries(uint _permissionTypeEntries)
        external
        onlyRegistryOwner
    {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

}
