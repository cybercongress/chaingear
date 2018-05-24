pragma solidity 0.4.24;

import "../../registry/RegistryPermissionControl.sol";

contract RegistryPermissionControlTestContract is RegistryPermissionControl {

    uint public uintValue_;

    function testOnlyPermissionedToCreateEntries(uint _newUintValue)
        external
        onlyPermissionedToCreateEntries
    {
        uintValue_ = _newUintValue;
    }
}
