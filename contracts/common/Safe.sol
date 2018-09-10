pragma solidity 0.4.24;


/**
* @title Safe contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Allows store etheirs which funded to Registry 
* @dev and claim them by Registry/associated token via Chaingear
* @notice not recommend to use before release!
*/
contract Safe {
    
    address public owner;

    constructor()
        public
        payable
    {
        owner = msg.sender;
    }

    /**
    * @dev Allows direct send only by owner.
    */
    function()
        external
        payable
    {
        require(msg.sender == owner);
    }

    /**
    * @dev Allows owner (chaingear) claim funds and transfer them to Registry admin
    * @param _entryOwner address transfer to, Registry-token admin
    * @param _amount uint claimed amount by Registry-token admin
    */
    function claim(
        address _entryOwner,
        uint256 _amount
    )
        external
    {
        require(msg.sender == owner);
        require(_amount <= address(this).balance);
        require(_entryOwner != 0x0);
        _entryOwner.transfer(_amount);
    }

}
