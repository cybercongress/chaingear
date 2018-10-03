pragma solidity ^0.4.24;

import "../registry/Registry.sol";
import "./RegistryBuilderInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Registry Creator engine/fabric
* @author cyber•Congress
* @dev Allows to Chaingear contract as builder create new Registries
* @dev with codebase which imported and deployed with this fabric
* @notice not recommend to use before release!
*/
contract RegistryBuilder is RegistryBuilderInterface, Ownable {

	/*
	* @dev Storage
	*/

    // @dev Holds address of contract which can call creation, means Chaingear
    address private chaingear;

	/*
	* @dev Constructor
	*/

    /**
    * @dev Contructor of RegistryCreators
    * @notice setting 0x0, then allows to owner to set builder/Chaingear
    * @notice after deploying needs to set up builder/Chaingear address
    */
    constructor() public {
        chaingear = address(0);
    }
    
    /**
    * @dev Disallows direct send by settings a default function without the `payable` flag.
    */
    function() external {}

	/*
	* @dev External Functions
	*/
    
    /**
    * @dev Allows chaingear (builder) create new registry
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @return address Address of new initialized Registry
    */
    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        returns (RegistryInterface)
    {
        require(msg.sender == chaingear);

        RegistryInterface registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        //Fabric as owner transfers ownership to Chaingear contract after creation
        registryContract.transferOwnership(chaingear);

        return registryContract;
    }

    function setChaingearAddress(
        address _chaingear
    )
        external
        onlyOwner
    {
        require(_chaingear != address(0));
        chaingear = _chaingear;
    }
    
    function getChaingearAddress()
        external
        view
        returns(
            address
        )
    {
        return chaingear;
    }
}
