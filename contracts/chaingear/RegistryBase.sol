pragma solidity ^0.4.19;


contract RegistryBase {

    struct RegistryMeta {
        string name;
        address contractAddress;
        address creator;
        string linkABI;
        uint registrationTimestamp;
        address owner;
    }

    RegistryMeta[] internal registries;

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

    function nameOf(uint256 _registryID)
        public
        view
        returns (string)
    {
        return registries[_registryID].name;
    }

    function contractAddressOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].contractAddress;
    }

    function creatorOf(uint256 _registryID)
        public
        view
        returns (address)
    {
        return registries[_registryID].creator;
    }

    function registryDateOf(uint256 _registryID)
        public
        view
        returns (uint)
    {
        return registries[_registryID].registrationTimestamp;
    }

    function ABILinkOf(uint256 _registryID)
        public
        view
        returns (string)
    {
        return registries[_registryID].linkABI;
    }

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

    function registriesAmount()
        public
        view
        returns (uint256)
    {
        return registries.length;
    }
}
