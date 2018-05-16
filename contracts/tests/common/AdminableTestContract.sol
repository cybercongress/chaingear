pragma solidity 0.4.23;

import "../../common/Adminable.sol";


contract AdminableTestContract is Adminable {

    uint public uintValue_;

    function testOnlyAdminModifier(uint _newUintValue)
        external
        onlyAdmin
    {
        uintValue_ = _newUintValue;
    }
}
