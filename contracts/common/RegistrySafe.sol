pragma solidity ^0.4.18;

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/lifecycle/Destructible.sol";


contract RegistrySafe is Ownable, Destructible {

    function RegistrySafe() public payable { }

    function claim(address _entryOwner, uint _amount)
        public
        onlyOwner
    {
        _entryOwner.transfer(_amount);
    }

}
