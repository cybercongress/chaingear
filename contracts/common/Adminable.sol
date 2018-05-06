pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract Adminable is Pausable {

    address public admin_;

    modifier onlyAdmin() {
        require(msg.sender == admin_);
        _;
    }

    constructor()
        public
    {
        // todo: better to use constructor, rather than tx.origin
        admin_ = tx.origin;
    }

    /**
    * @dev Change Registry admin
    * @param _newAdmin new Registry admin
    */
    function changeAdmin(address _newAdmin)
        public
        whenNotPaused
        onlyOwner
    {
        admin_ = _newAdmin;
    }
}
