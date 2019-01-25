pragma solidity 0.4.25;

import "../databases/DatabaseV1.sol";
import "../common/IDatabase.sol";
import "../common/IDatabaseBuilder.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract DatabaseBuilderV1 is IDatabaseBuilder, SupportsInterfaceWithLookup {

	/*
	*  Storage
	*/

    address private chaingear;    
    address private owner;
    
    bytes4 private constant INTERFACE_CHAINGEAR_EULER_ID = 0xea1db66f; 
    bytes4 private constant INTERFACE_DATABASE_BUILDER_EULER_ID = 0xce8bbf93;
    
    /*
    *  Events
    */
    
    event DatabaseDeployed(
        string name,
        string symbol,
        IDatabase database
    );

	/*
	*  Constructor
	*/

    constructor() public {
        chaingear = address(0);
        owner = msg.sender;    
        _registerInterface(INTERFACE_DATABASE_BUILDER_EULER_ID);
    }
    
    /*
    *  Fallback
    */
    
    function() external {}

	/*
	*  External Functions
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
        emit DatabaseDeployed(_name, _symbol, databaseContract);
        
        return databaseContract;
    }
    
    /*
    *  Views
    */

    function setChaingearAddress(address _chaingear)
        external
    {
        require(msg.sender == owner);
        
        SupportsInterfaceWithLookup support = SupportsInterfaceWithLookup(_chaingear);
        require(support.supportsInterface(INTERFACE_CHAINGEAR_EULER_ID));
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
