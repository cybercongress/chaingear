pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
/* import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol"; */

/**
* @title RegistySafe contract
* @author cyber•Congress
* @dev Allows store etheirs and claim them by owner
* @notice not recommend to use before release!
*/
contract RegistrySafe is Ownable {

    /*
    *  Contructor Function
    */

    /**
    * @dev Constructor of contract, payable
    */
    constructor()
        public
        payable
    { }

    /*
    *  Public Functions
    */

    /**
    * @dev Allows direct send only by owner.
    */
    function()
        public
    {
        require(msg.sender == owner);
    }

    /**
    * @dev Allows owner (chaingear) claim funds and transfer them to token-entry owner
    * @param _entryOwner address transfer to, token-entry owner
    * @param _amount uint claimed amount by token-entry owner
    */
    function claim(
        address _entryOwner,
        uint _amount
    )
        public
        onlyOwner
    {
        _entryOwner.transfer(_amount);
    }

}
