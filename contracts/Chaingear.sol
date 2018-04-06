pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "./common/SplitPaymentChangeable.sol";
import "./common/IPFSeable.sol";


contract Chaingear is ERC721Token, Ownable, IPFSeable, Pausable, Destructible, SplitPaymentChangeable {

    using SafeMath for uint256;
    using AddressUtils for address;

    struct Registry {
        string name;
        address contractAddress;
        address creator;
        uint registrationTimestamp;
        string linkABI;
        address owner;
    }

    string constant public NAME = "CHAINGEAR";
    string public chaingearDescription_;
    uint public registryRegistrationFee_;

    Registry[] public registries;

    event RegistryRegistered(string name, address creator, uint entryId);
    event RegistryUnregistered(address owner, uint registryId);


    function Chaingear(
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        string _linkABI,
        uint _registrationFee,
        string _chaingearSymbol
    ) SplitPaymentChangeable(_benefitiaries, _shares) ERC721Token(NAME, _chaingearSymbol) public
    {
        registryRegistrationFee_ = _registrationFee;
        chaingearDescription_ = _description;
        linkABI_ = _linkABI;
    }

    function registerRegistry(string _registryName, string _linkABI, address _registryAddress) public payable whenNotPaused returns (uint256 registryId) {
        require(msg.value == registryRegistrationFee_);
        // checkInterface(_registryAddress)

        Registry memory registry = (Registry(
        {
            name: _registryName,
            contractAddress: _registryAddress,
            creator: msg.sender,
            linkABI: _linkABI,
            registrationTimestamp: now,
            owner: msg.sender
        }));
        uint256 newRegistryId = registries.push(registry) - 1;
        ERC721Token._mint(msg.sender, newRegistryId);
        RegistryRegistered(_registryName, msg.sender, registries.length - 1);
        return registryId;
    }

    function unregisterRegistry(uint256 _registryID) external whenNotPaused {
        require (ERC721BasicToken.ownerOf(_registryID) == msg.sender);

        uint256 registryIndex = allTokensIndex[_registryID];
        uint256 lastRegistryIndex = registries.length.sub(1);
        Registry storage lastRegistry = registries[lastRegistryIndex];

        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        ERC721Token._burn(msg.sender, _registryID);

        //rethink this event
        RegistryUnregistered(msg.sender, _registryID);
    }

    function getRegistry(uint256 _registryID) constant public returns (string name, address contractAddress, address creator, uint registrationTimestamp, string linkABI, address owner) {
        return (
            registries[_registryID].name,
            registries[_registryID].contractAddress,
            registries[_registryID].creator,
            registries[_registryID].registrationTimestamp,
            registries[_registryID].linkABI,
            registries[_registryID].owner
        );
    }

    function updateRegistrationFee(uint _fee) external onlyOwner {
        registryRegistrationFee_ = _fee;
    }

    /* function updateRegistryOwnership(address _owner) public returns (uint256 registryId) {

    } */

    function updateDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        chaingearDescription_ = _description;
    }
}
