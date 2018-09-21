pragma solidity ^0.4.24;

import "../registry/Registry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Registry Creator engine/fabric
* @author cyber•Congress
* @dev Allows to Chaingear contract as builder create new Registries
* @dev with codebase which imported and deployed with this fabric
* @notice not recommend to use before release!
*/
//// [review] Rename this contract to RegistryBuilder because of 'builder' variable name (see below)
contract RegistryCreator is Ownable {

	/*
	* @dev Storage
	*/

    // @dev Holds address of contract which can call creation, means Chaingear
    address internal builder;

	/*
	* @dev Constructor
	*/

    /**
    * @dev Contructor of RegistryCreators
    * @notice setting 0x0, then allows to owner to set builder/Chaingear
    * @notice after deploying needs to set up builder/Chaingear address
    */
    constructor()
        public
    {
        //// [review] Recommendation -> initialize the var. in the declaration (above)
        builder = 0x0;
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
    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        returns (address)
    {
        require(msg.sender == builder);

        address registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        //Fabric as owner transfers ownership to Chaingear contract after creation
        Registry(registryContract).transferOwnership(builder);

        return registryContract;
    }

    /**
    * @dev Registry builder setter, owners sets Chaingear address
    * @param _builder address
    */
    function setBuilder(
        address _builder
    )
        external
        onlyOwner
    {
        require(_builder != 0x0);
        builder = _builder;
    }

	/*
	*  View Functions
	*/

    /**
    * @dev RegistryCreator's builder getter
    * @return address of setted Registry builder (Chaingear contract)
    */
    //// [review] Recommendation -> use 'public' modifier for the 'builded' var instead of getRegistryBuilder access method 
    function getRegistryBuilder()
        external
        view
        returns (address)
    {
        return builder;
    }
}
