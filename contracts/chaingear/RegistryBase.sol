pragma solidity ^0.4.19;
/**
* @title holds struct of data with describes registry metainformation which
* associated with token, views function for registry metainformation.
* @author Cyber Congress
* @dev All function calls are currently implement without side effects
*/

/// @dev Registry base constructor
contract RegistryBase {

    /**
    * @dev data structure with Regisrty parameters
    * @param Registry name
    * @param address of the contract
    * @param address of Registry creator
    * @param Registry' link to ABI
    * @param timestamp of Registry creation
    * @param address of Registry owner
    */
    struct RegistryMeta {
        string name;
        address contractAddress;
        address creator;
        string linkABI;
        uint registrationTimestamp;
        address owner;
    }

    /// @dev creation an internal data structure
    RegistryMeta[] internal registries;

    /**
    * @dev an event of Registry creation
    * @param name of Registry
    * @param address of Registry
    * @param address of Registry creator
    * @param Registry ID
    */
    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint registryID
    );

    // event RegistryUnregistered(
    //     address owner,
    //     string registryName
    // );

    // event RegistryTransferred(
    //     address caller,
    //     string registryName,
    //     address newOwner
    // );

    /**
    /// @dev Registry' name getter
    /// @param Registry ID
    /// @return name of Registry
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
    * @param Registry ID
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
    * @param Registry ID
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
    * @param Registry ID
    * @return timestamp of creating Registy
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
    * @param Registry ID
    * @return Registy' ABI link
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
    * @param Registry ID
    * @return Registy' owner address
    */
    function registryOwnerOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].owner;
    }

    // function versionOf(uint256 _registryID)
    //     public
    //     view
    //     returns (bytes32)
    // {
    //     return registries[_registryID].chaingeareableVersion;
    // }

    /**
    * @dev Registy' metainfo getter
    * @param Registry ID
    * @return Registy' name
    * @return Registy' address
    * @return Registy' creator address
    * @return Registy' creation timestamp
    * @return Registy' ABI link
    * @return Registy' owner address
    */
    function registryInfo(uint256 _registryID)
        public
        view
        returns (string, address, address, uint, string, address)
    {
        return (
            nameOf(_registryID),
            contractAddressOf(_registryID),
            creatorOf(_registryID),
            registryDateOf(_registryID),
            ABILinkOf(_registryID),
            registryOwnerOf(_registryID)
            // versionOf(_registryID)
        );
    }

    // function registryBalanceInfo(uint256 _registryID)
    //     public
    //     view
    //     returns (uint, uint)
    // {
    //     return (
    //         currentRegistryBalanceETHOf(_registryID),
    //         accumulatedRegistryETHOf(_registryID)
    //     );
    // }

    /**
    * @dev Registies amount getter
    * @return amounts of Registries
    */
    function registriesAmount()
        public
        view
        returns (uint256)
    {
        return registries.length;
    }
}
