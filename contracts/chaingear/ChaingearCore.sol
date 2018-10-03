pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../RegistryCreator/RegistryBuilderInterface.sol";
import "../common/Safe.sol";


/**
* @title Chaingear core contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Holds registry builders data/logic and basic chaingear params
* @notice not recommend to use before release!
*/

contract ChaingearCore is Pausable, Destructible {

	/*
	*  Storage
	*/

    // @dev Sctruct which describes RegistryBuilder, includes IPFS links to registry ABI
    struct RegistryBuilder {
        RegistryBuilderInterface builderAddress;
        string linkToABI;
        string description;
    }
    
    mapping (string => RegistryBuilder) internal buildersVersion;

    Safe internal chaingearSafe;

    string internal chaingearDescription;
    
    uint256 internal registryRegistrationFee;
    
    /*
    *  External Functions
    */

    /**
    * @dev Provides funcitonality for adding builders of different kind of registries
    * @param _version string which represents name of registry type/version
    * @param _builderAddress RegistryBuilderInterface address of registry builder/fabric
    * @param _linkToABI string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about registry fabric type
    * @notice Only owner of metaregistry/chaingear allowed to add builders
    */
    function addRegistryBuilderVersion(
        string _version, 
        RegistryBuilderInterface _builderAddress,
        string _linkToABI,
        string _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(buildersVersion[_version].builderAddress == address(0));
        
        buildersVersion[_version] = (RegistryBuilder(
        {
            builderAddress: _builderAddress,
            linkToABI: _linkToABI,
            description: _description
        }));
    }

    function updateRegistrationFee(
        uint256 _newFee
    )
        external
        onlyOwner
        whenPaused
    {
        registryRegistrationFee = _newFee;
    }

    function updateDescription(
        string _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        uint len = bytes(_description).length;
        require(len <= 256);

        chaingearDescription = _description;
    }

	/*
	*  View Functions
	*/
    
    /**
    * @dev Allows get information about given version of registry builder and registry
    * @param _version String which represents name of given registry type
    * @return address of registry fabric for this version
    * @return string which represents IPFS hash to JSON with ABI of registry 
    * @return string which represents info about this registry 
    */
    function getRegistryBuilder(
        string _version
    ) 
        external
        view
        returns (
            address,
            string,
            string
        )
    {
        return(
            buildersVersion[_version].builderAddress,
            buildersVersion[_version].linkToABI,
            buildersVersion[_version].description
        );
    }

    function getDescription()
        external
        view
        returns (
            string
        )
    {
        return chaingearDescription;
    }

    function getRegistrationFee()
        external
        view
        returns (
            uint256
        )
    {
        return registryRegistrationFee;
    }
    
    function getSafeBalance()
        external
        view
        returns (
            uint256
        )
    {
        return address(chaingearSafe).balance;
    }
    
    function getSafe()
        external
        view
        returns (
            address
        )
    {
        return chaingearSafe;
    }
}
