pragma solidity 0.4.24;
import "../common/RegistryInterface.sol";


/**
* @title RegistryBase contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Contracts which holds logic and struct of data witch describes registry metainformation which
* associated with token, provides views function for registry metainformation.
* @notice not recommend to use before release!
*/

//todo rename: we have RegistryBase and RegistryInterface
contract RegistryBase {
    
    /*
    *  Storage
    */

    // @dev Sctruct which describes registry metainformation with balance state and status
    struct RegistryMeta {
        address contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        uint256 currentRegistryBalanceETH;
        uint256 accumulatedRegistryETH;
    }
    

    // @dev Array of registries data
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

    // @dev Events witch signals that Registry adminship transferred
    // @notice that also means associated token transferred too
    event RegistryChangedOwner(
         address caller,
         uint256 registyID,
         address newOwner
    );
    
    // @dev Events witch signals that Registry unregistered from Chaingear
    // @notice adminship of Registry transfers from Chaingear to Admin
    event RegistryUnregistered(
        address admin,
        string name
    );

	/*
	*  External Functions
	*/

    /**
    * @dev Registy metainfo getter
    * @param _registryID uint256 Registry ID, associated ERC721 token ID
    * @return string Registy name
    * @return string Registy symbol
    * @return address Registy address
    * @return address Registy creator address
    * @return string Registy version
    * @return uint Registy creation timestamp
    * @return address Registy admin address
    */
    function registryInfo(
        uint256 _registryID
    )
        external
        view
        returns (
            string,
            string,
            address,
            address,
            string,
            uint,
            address
        )
    {
        address contractAddress = registries[_registryID].contractAddress;
        
        return (
            RegistryInterface(contractAddress).name(),
            RegistryInterface(contractAddress).symbol(),
            contractAddress,
            registries[_registryID].creator,
            registries[_registryID].version,
            registries[_registryID].registrationTimestamp,
            RegistryInterface(contractAddress).getAdmin()
        );
    }
    
    /**
    * @dev Registy funding stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy current balance in wei, which stored in Safe
    * @return uint Registy total accumulated balance in wei
    */
    function registryBalanceInfo(
        uint256 _registryID
    )
        external
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
        external
        view
        returns (uint256)
    {
        return registries.length;
    }
}
