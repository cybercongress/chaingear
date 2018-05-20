pragma solidity 0.4.23;

import "../registry/Registry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Registry Creator engine
* @author cyber•Congress
* @dev Allows setted Chaingear contract create new Registries via this proxy contract
* @notice not recommend to use before release!
*/
contract RegistryCreator is Ownable {

	/*
	* @dev Srorage
	*/

    // @dev Holds address of contract which can call creation, means Chaingear
    address internal builder;

	/*
	* @dev Constructor
	*/

    /**
    * @dev Contructor of RegistryCreators
    * @notice setting 0x0, than whet creating Chaingear pass RegistryCreator address
    * @notice after that need to set up builder, Chaingear address
    */
    constructor()
        public
    {
        builder = 0x0;
    }

	/*
	* @dev External Functions
	*/
    
    /**
    * @dev Disallows direct send by settings a default function without the `payable` flag.
    */
    function() external {
    }

    /**
    * @dev Allows chaingear (builder) create new registry
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @return address of new registry
    */
    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        returns (address newRegistryContract)
    {
        require(msg.sender == builder);

        newRegistryContract = createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );

        return newRegistryContract;
    }

    /**
    * @dev Registry builder setter
    * @param _builder address
    */
    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder = _builder;
    }

	/*
	*  Private Functions
	*/

    /**
    * @dev Private funtcion for new Registry creation
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @return address of new registry 
    */
    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        private
        returns (address registryContract)
    {
        registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        Registry(registryContract).transferOwnership(msg.sender);

        return registryContract;
    }

	/*
	*  View Functions
	*/

    /**
    * @dev RegistryCreator's builder getter
    * @return address of setted Registry builder (Chaingear contract)
    */
    function getRegistryBuilder()
        public
        view
        returns (
            address
        )
    {
        return builder;
    }
}
