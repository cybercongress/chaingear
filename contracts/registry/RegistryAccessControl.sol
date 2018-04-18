pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";

contract RegistryAccessControl is Ownable, Destructible {

    address internal creator_;

    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyCreator, Whitelist, AllUsers}

    modifier onlyCreator() {
        require(msg.sender == creator_);
        _;
    }

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyCreator) {
            require(msg.sender == creator_);
        }
        // if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
        //     require(whitelist[msg.sender] || msg.sender == creator_);
        // }
        _;
    }

    function RegistryAccessControl()
        public
    {
        creator_ = tx.origin;
    }

    function creator()
        public
        view
        returns (address)
    {
        return creator_;
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
        onlyCreator
    {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

}
