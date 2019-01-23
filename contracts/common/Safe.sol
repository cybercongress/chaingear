pragma solidity 0.4.25;


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract Safe {
    
    address private owner;

    constructor() public
    {
        owner = msg.sender;
    }

    function()
        external
        payable
    {
        require(msg.sender == owner);
    }

    function claim(address _entryOwner, uint256 _amount)
        external
    {
        require(msg.sender == owner);
        require(_amount <= address(this).balance);
        require(_entryOwner != address(0));
        
        _entryOwner.transfer(_amount);
    }

    function getOwner()
        external
        view
        returns(address)
    {
        return owner;
    }
}
