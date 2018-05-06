pragma solidity 0.4.23;


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
    struct RegistryMeta {
        string name;
        address contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        address owner;
        /* uint currentRegistryBalanceETH;
        uint accumulatedRegistryETH; */
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
    // @notice ownership of Registry transfers from Chaingear to Creator
    event RegistryUnregistered(
        address owner,
        string name
    );

	/*
	*  View Functions
	*/

    /**
    * @dev Registry' name getter
    * @param _registryID uint256 Registry ID
    * @return string name of Registry
    */
    function nameOf(uint256 _registryID)
        public
        view
        returns (string)
    {
        return registries[_registryID].name;
    }

    /**
    * @dev Registry' address getter
    * @param _registryID uint256 Registry ID
    * @return address of Registry
    */
    function contractAddressOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].contractAddress;
    }

    /**
    * @dev Registy' creator address getter
    * @param _registryID uint256 Registry ID
    * @return address of Registry creator
    */
    function creatorOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].creator;
    }
    
    function versionOf(uint256 _registryID)
        public
        view
        returns (string)
    {
        return registries[_registryID].version;
    }

    /**
    * @dev Registry' creating timestamp getter
    * @param _registryID uint256 Registry ID
    * @return uint of creating Registy
    */
    function registryDateOf(uint256 _registryID)
        public
        view
        returns (uint)
    {
        return registries[_registryID].registrationTimestamp;
    }

    /**
    * @dev Registy' ABI link getter
    * @param _registryID uint256 Registry ID
    * @return string Registy' hash IPFS link to JSON with ABI
    */
    function ABILinkOf(uint256 _registryID)
        public
        view
        returns (string)
    {
        return registries[_registryID].linkABI;
    }

    /**
    * @dev Registy' owner address getter
    * @param _registryID uint256 Registry ID
    * @return address Registy' owner address
    */
    function registryOwnerOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].owner;
    }

    /**
    * @dev Registy' metainfo getter
    * @param _registryID uint256 Registry ID
    * @return string Registy' name
    * @return address Registy' address
    * @return address Registy' creator address
    * @return uint Registy' creation timestamp
    * @return string Registy' IPFS hash link to JSON with ABI
    * @return address Registy' owner address
    */
    function registryInfo(uint256 _registryID)
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
            nameOf(_registryID),
            contractAddressOf(_registryID),
            creatorOf(_registryID),
            versionOf(_registryID),
            registryDateOf(_registryID),
            ABILinkOf(_registryID),
            registryOwnerOf(_registryID)
        );
    }

    /**
    * @dev Registy' current balance in safe getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy' balance in safe in wei
    */
    /* function currentRegistryBalanceETHOf(uint256 _registryID)
        public
        view
        returns (uint currentRegistryBalanceETH)
    {
        return registries[_registryID].currentRegistryBalanceETH;
    } */

    /**
    * @dev Registy' total accumulated balance in safe getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy' total accumulated balance in safe in wei
    */
    /* function accumulatedRegistryETHOf(uint256 _registryID)
        public
        view
        returns (uint accumulatedRegistryETH)
    {
        return registries[_registryID].accumulatedRegistryETH;
    } */

    /**
    * @dev Registy' safe stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy' balance in safe in wei
    * @return uint Registy' total accumulated balance in safe in wei
    */
    /* function registryBalanceInfo(uint256 _registryID)
        public
        view
        returns (
            uint currentRegistryBalanceETH,
            uint accumulatedRegistryETH
        )
    {
        return (
            currentRegistryBalanceETHOf(_registryID),
            accumulatedRegistryETHOf(_registryID)
        );
    } */

    /**
    * @dev Registies amount getter
    * @return uint256 amounts of Registries
    */
    function registriesAmount()
        public
        view
        returns (uint256)
    {
        return registries.length;
    }
}
