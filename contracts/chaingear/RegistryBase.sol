pragma solidity 0.4.19;


/**
* @title holds struct of data with describes registry metainformation which
* associated with token, views function for registry metainformation.
* @author Cyber Congress
* @dev All function calls are currently implement without side effects
*/
contract RegistryBase {

	/*
	*  Storage
	*/

    struct RegistryMeta {
        string name;
        address contractAddress;
        address creator;
        string linkABI;
        uint registrationTimestamp;
        address owner;
        uint currentRegistryBalanceETH;
        uint accumulatedRegistryETH;
    }

    // @dev creation an internal data structure
    RegistryMeta[] internal registries;

	/*
	*  Events
	*/

    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint registryID
    );

    event RegistryTransferred(
         address caller,
         string registryName,
         uint256 registyID,
         address newOwner
    );
    
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
    function nameOf(
        uint256 _registryID
    )
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

    /**
    * @dev Registy' creating timestamp getter
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
    * @return string Registy' ABI link
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
    * @return string Registy' ABI link
    * @return address Registy' owner address
    */
    function registryInfo(uint256 _registryID)
        public
        view
        returns (
            string,
            address,
            address,
            uint,
            string,
            address
        )
    {
        return (
            nameOf(_registryID),
            contractAddressOf(_registryID),
            creatorOf(_registryID),
            registryDateOf(_registryID),
            ABILinkOf(_registryID),
            registryOwnerOf(_registryID)
        );
    }

    function currentRegistryBalanceETHOf( uint256 _registryID)
        public
        view
        returns (uint)
    {
        return registries[_registryID].currentRegistryBalanceETH;
    }

    function accumulatedRegistryETHOf(uint256 _registryID)
        public
        view
        returns (uint)
    {
        return registries[_registryID].accumulatedRegistryETH;
    }


    function registryBalanceInfo(uint256 _registryID)
        public
        view
        returns (
            uint,
            uint
        )
    {
        return (
            currentRegistryBalanceETHOf(_registryID),
            accumulatedRegistryETHOf(_registryID)
        );
    }

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
