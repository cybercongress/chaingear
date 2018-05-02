pragma solidity 0.4.19;

import "../registry/Registry.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* @title Registry creator engine
* @author Cyber Congress
* @dev not recommend to use before release!
*/
contract RegistryCreator is Ownable {

	/*
	* @dev Srorage
	*/

    // @dev initiate builder as creator of Registry
    address internal builder_;

	/*
	* @dev Constructor
	*/

    function RegistryCreator(address _builder)
        public
    {
        builder_ = _builder;
    }

	/*
	* @dev External Functions
	*/

    function() external {
    }

    /**
    * @dev create new Registry
    * @param addresses of benefitiaries
    * @param uint256 shares distributing
    * @param Registry name string
    * @param Entries link to ABI Entries contract string
    * @param bytecode of entries contract string
    * @return new Registry contract Registry
    */
    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        external
        returns (Registry newRegistryContract)
    {
        require(msg.sender == builder_);

        newRegistryContract = createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );

        return newRegistryContract;
    }

    /**
    * @dev Registry builder setter
    * @param new builder address
    */
    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder_ = _builder;
    }

	/*
	*  Internal Functions
	*/

    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        internal
        returns (Registry registryContract)
    {
        registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
        registryContract.transferOwnership(msg.sender);

        return registryContract;
    }

	/*
	*  View Functions
	*/

  /**
  * @dev Registry builder getter
  * @return builder address
  */
    function registryBuilder()
        public
        view
        returns (address)
    {
        return builder_;
    }
}
