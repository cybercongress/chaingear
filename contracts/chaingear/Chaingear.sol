pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "../common/SplitPaymentChangeable.sol";
import "../common/IPFSeable.sol";
import "./RegistryBase.sol";


contract Chaingear is RegistryBase, ERC721Token, IPFSeable, SplitPaymentChangeable {

    using SafeMath for uint256;
    using AddressUtils for address;

    string internal chaingearDescription_;
    uint internal registryRegistrationFee_;

    function Chaingear(
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        string _linkABI,
        uint _registrationFee,
        string _chaingearName,
        string _chaingearSymbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_chaingearName, _chaingearSymbol)
        public
        payable
    {
        registryRegistrationFee_ = _registrationFee;
        chaingearDescription_ = _description;
        linkABI_ = _linkABI;
    }


    function registerRegistry(string _registryName, string _linkABI, address _registryAddress)
        external
        payable
        whenNotPaused
        returns (uint256 registryId)
    {
        require(msg.value == registryRegistrationFee_);
        // require checkInterface(_registryAddress)
        // require setRegisteredInChaingear (-> CANNOT DELETE/TRANSFER LOCAL)

        Registry memory registry = (Registry(
        {
            name: _registryName,
            contractAddress: _registryAddress,
            creator: msg.sender, //TODO check throw interface
            linkABI: _linkABI,
            registrationTimestamp: block.timestamp,
            owner: msg.sender
        }));

        uint256 newRegistryId = registries.push(registry) - 1;
        super._mint(msg.sender, newRegistryId);

         RegistryRegistered(_registryName, msg.sender, newRegistryId);

        return newRegistryId;
    }

    function unregisterRegistry(uint256 _registryID)
        external
        whenNotPaused
    {
        require (ERC721BasicToken.ownerOf(_registryID) == msg.sender);
        // require checkValidState(_registryAddress)
        // require unsetRegisteredInChaingear(-> CAN DELETE/TRANSFER LOCAL)

        string storage registryName = registries[_registryID].name;
        uint256 registryIndex = allTokensIndex[_registryID];
        uint256 lastRegistryIndex = registries.length.sub(1);
        Registry storage lastRegistry = registries[lastRegistryIndex];

        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        super._burn(msg.sender, _registryID);

        //rethink this event
         RegistryUnregistered(msg.sender, registryName);
    }

    function updateRegistryOwnership(uint256 _registryID, address _newOwner)
        external
        whenNotPaused
    {
        require (ERC721BasicToken.ownerOf(_registryID) == msg.sender);
        // require checkValidState(_registryAddress)
        // require unsetRegisteredInChaingear
        // check whitelist/permissioning
        string storage registryName = registries[_registryID].name;
        super.removeTokenFrom(msg.sender, _registryID);
        super.addTokenTo(_newOwner, _registryID);

         RegistryTransferred(msg.sender, registryName, _newOwner);
    }

    function registryRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee_;
    }

    function updateRegistrationFee(uint _newFee)
        external
        onlyOwner
    {
        registryRegistrationFee_ = _newFee;
    }

    function chaingearDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription_;
    }

    function updateDescription(string _description)
        external
        onlyOwner
    {
        uint len = bytes(_description).length;
        require(len <= 128);

        chaingearDescription_ = _description;
    }
}
