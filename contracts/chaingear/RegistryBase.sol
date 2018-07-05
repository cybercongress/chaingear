pragma solidity 0.4.24;
import "../common/RegistryBasic.sol";


/**
* @title Contracts which holds logic and struct of data witch describes registry metainformation which
* associated with token, provides views function for registry metainformation.
* @author cyber•Congress
* @notice not recommend to use before release!
*/
//todo rename: we have RegistryBase and RegistryBasic
contract RegistryBase {
    
    /*
    *  Storage
    */

    // @dev Sctruct which describes registry metainformation with balance state and status
    /*
    * @param Registry name string
    * @param Registry contract address
    * @param Registry creator address
    * @param Registry version string
    * @param Registry ABI link string
    * @param Registry creation timestamp uint
    * @param Registry admin address
     */
    struct RegistryMeta {
        /* string name;
        string symbol; */
        address contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        /* address admin; */
        uint256 currentRegistryBalanceETH;
        uint256 accumulatedRegistryETH;
    }
    

    // @dev Array of registries
    RegistryMeta[] internal registries;

	/*
	*  Events
	*/

    // @dev Events witch signals that new Registry registered
    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint registryID
    );

    // @dev Events witch signals that Registry' adminship transferred
    // @notice that also means associated token transferred too
    event RegistryTransferred(
         address caller,
         uint256 registyID,
         address newOwner
    );
    
    // @dev Events witch signals that Registry' unregistered from Chaingear
    // @notice adminship of Registry transfers from Chaingear to Admin
    event RegistryUnregistered(
        address admin,
        string name
    );

	/*
	*  View Functions
	*/

    /**
    * @dev Registy' metainfo getter
    * @param _registryID uint256 Registry ID
    * @return string Registy' name
    * @return address Registy' address
    * @return address Registy' creator address
    * @return string Registy' version 
    * @return uint Registy' creation timestamp
    * @return string Registy' IPFS hash link to JSON with ABI
    * @return address Registy' admin address
    */
    function registryInfo(
        uint256 _registryID
    )
        public
        view
        returns (
            string,
            string,
            address,
            address,
            string,
            uint,
            address
            /* string */
        )
    {
        address contractAddress = registries[_registryID].contractAddress;
        
        return (
            RegistryBasic(contractAddress).name(),
            RegistryBasic(contractAddress).symbol(),
            contractAddress,
            registries[_registryID].creator,
            registries[_registryID].version,
            registries[_registryID].registrationTimestamp,
            RegistryBasic(contractAddress).getAdmin()
            /* registries[_registryID].linkABI */
        );
    }
    
    /**
    * @dev Registy' safe stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy' balance in safe in wei
    * @return uint Registy' total accumulated balance in safe in wei
    */
    function registryBalanceInfo(
        uint256 _registryID
    )
        public
        view
        returns (
            uint256,
            uint256 
        )
    {
        return (
            registries[_registryID].currentRegistryBalanceETH,
            registries[_registryID].accumulatedRegistryETH
        );
    }

    /**
    * @dev Registies amount getter
    * @return uint256 amounts of Registries
    */
    function registriesAmount()
        public
        view
        returns (
            uint256
        )
    {
        return registries.length;
    }
}
