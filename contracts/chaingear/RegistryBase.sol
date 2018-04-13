pragma solidity ^0.4.18;

import "./ChaingearAccessControl.sol";


contract RegistryBase is ChaingearAccessControl {

    struct Registry {
        string name;
        address contractAddress;
        address creator;
        uint registrationTimestamp;
        string linkABI;
        address owner;
        bytes32 chaingeareableVersion;
    }

    Registry[] internal registries;

    event RegistryRegistered(
        string name,
        address creator,
        uint registryId
    );

    event RegistryUnregistered(
        address owner,
        string registryName
    );

    event RegistryTransferred(
        address caller,
        string registryName,
        address newOwner
    );

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

    function versionOf(uint256 _registryID)
        public
        view
        returns (bytes32)
    {
        return registries[_registryID].chaingeareableVersion;
    }

    function registryInfo(uint256 _registryID)
        public
        view
        returns (string, address, address, uint, string, address, bytes32)
    {
        return (
            nameOf(_registryID),
            contractAddressOf(_registryID),
            creatorOf(_registryID),
            registryDateOf(_registryID),
            ABILinkOf(_registryID),
            registryOwnerOf(_registryID),
            versionOf(_registryID)
        );
    }

    function registriesAmount()
        public
        view
        returns (uint256)
    {
        return registries.length;
    }
}
