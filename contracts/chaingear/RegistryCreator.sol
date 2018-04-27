pragma solidity 0.4.19;

import "../registry/Registry.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Registry Creator contract
* @author cyber•Congress
* @dev Allows setted Chaingear contract create new Registries via this proxy contract
* @notice not recommend to use before release!
*/
contract RegistryCreator is Ownable {

	/*
	*  Srorage
	*/

    // @dev Holds address of contract which can call creation, means Chaingear
    address internal builder_;

	/*
	*  Constructor
	*/

    /**
    * @dev Contructor of RegistryCreators
    * @notice setting 0x0, than whet creating Chaingear pass RegistryCreator address
    * @notice after that need to set up builder, Chaingear address
    */
    function RegistryCreator()
        public
    {
        builder_ = 0x0;
    }

	/*
	*  External Functions
	*/
    
    /**
    * @dev Disallows direct send by settings a default function without the `payable` flag.
    */
    function() external {
    }

    /**
    * @dev Allows chaingear (builder_) create new registry
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @param _linkToABIOfEntriesContract string IPFS hash link to JSON ABI of Entries contract
    * @param _bytecodeOfEntriesContract bytes bytecode with which Registry creates custom registry' entries contract 
    * @return Registy new registry address
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
    * @dev
    * @param
    */
    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder_ = _builder;
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
    * @param _linkToABIOfEntriesContract string IPFS hash link to JSON ABI of Entries contract
    * @param _bytecodeOfEntriesContract bytes bytecode with which Registry creates custom registry' entries contract
    * @return Registy new registry address
    */
    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        private
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
    * @dev RegistryCreator's builder getter
    * @return address of setted Registry Buyilder (Chaingear contract)
    */
    function registryBuilder()
        public
        view
        returns (address)
    {
        return builder_;
    }
}
