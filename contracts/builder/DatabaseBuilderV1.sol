pragma solidity 0.4.25;

import "../databases/DatabaseV1.sol";
import "../common/IDatabase.sol";
import "../common/IDatabaseBuilder.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract DatabaseBuilderV1 is IDatabaseBuilder {

	/*
	* @dev Storage
	*/

    address private chaingear;    
    address private owner;

	/*
	* @dev Constructor
	*/

    constructor() public {
        chaingear = address(0);
        owner = msg.sender;
    }
    
    /*
    * @dev Fallback
    */
    
    function() external {}

	/*
	* @dev External Functions
	*/
    
    function deployDatabase(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        returns (IDatabase)
    {
        require(msg.sender == chaingear);

        IDatabase databaseContract = new DatabaseV1(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        databaseContract.transferOwnership(chaingear);

        return databaseContract;
    }

    function setChaingearAddress(address _chaingear)
        external
    {
        require(msg.sender == owner);
        require(_chaingear != address(0));
        chaingear = _chaingear;
    }
    
    function getChaingearAddress()
        external
        view
        returns (address)
    {
        return chaingear;
    }
    
    function getOwner()
        external
        view
        returns (address)
    {
        return owner;
    }
}
