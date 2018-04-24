pragma solidity ^0.4.19;

import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/lifecycle/Destructible.sol";


contract RegistrySafe is Ownable, Destructible {

    function RegistrySafe() public payable { }

    function() public {
        require(msg.sender == owner);
    }


    function claim(address _entryOwner, uint _amount)
        public
        onlyOwner
    {
        _entryOwner.transfer(_amount);
    }

}
