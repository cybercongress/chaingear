pragma solidity 0.4.24;


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
    * @param Registry owner address
     */
    struct RegistryMeta {
        string name;
        address contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        address owner;
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

    // @dev Events witch signals that Registry' ownership transferred
    // @notice that also means associated token transferred too
    event RegistryTransferred(
         address caller,
         string registryName,
         uint256 registyID,
         address newOwner
    );
    
    // @dev Events witch signals that Registry' unregistered from Chaingear
    // @notice ownership of Registry transfers from Chaingear to Admin
    event RegistryUnregistered(
        address owner,
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
    * @return address Registy' owner address
    */
    function registryInfo(
        uint256 _registryID
    )
        public
        view
        returns (
            string,
            address,
            address,
            string,
            uint,
            string,
            address
        )
    {
        return (
            registries[_registryID].name,
            registries[_registryID].contractAddress,
            registries[_registryID].creator,
            registries[_registryID].version,
            registries[_registryID].registrationTimestamp,
            registries[_registryID].linkABI,
            registries[_registryID].owner
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
