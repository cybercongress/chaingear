pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "zeppelin-solidity/contracts/ownership/Whitelist.sol";


contract RegistryAccessControl is Ownable, Whitelist, Destructible, Pausable {

    PermissionTypeEntries public permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyOwner, Whitelist, AllUsers}

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyOwner) {
            require(msg.sender == owner);
        } else if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
            require(whitelist[msg.sender] || msg.sender == owner);
        }
        _;
    }

    function updatePermissionTypeEntries(uint _permissionTypeEntries) external onlyOwner {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

}
