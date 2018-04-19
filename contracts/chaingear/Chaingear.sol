pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "../common/SplitPaymentChangeable.sol";
import "./ChaingearCore.sol";
import "../registry/Registry.sol";


contract Chaingear is ERC721Token, SplitPaymentChangeable, ChaingearCore {

    using SafeMath for uint256;
    using AddressUtils for address;

    function Chaingear(
        RegistryCreator _creator,
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
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
        creator_ = _creator;
    }


    function registerRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        external
        payable
        whenNotPaused
        returns (address registryAddress, uint256 registryID)
    {
        require(msg.value == registryRegistrationFee_);

        return createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
    }

    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        private
        returns (address newRegistryContract, uint256 newRegistryID)
    {
        Registry registryContract = creator_.create(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
        registryContract.transferOwnership(msg.sender);

        RegistryMeta memory registry = (RegistryMeta(
        {
            name: _name,
            contractAddress: registryContract,
            creator: msg.sender,
            linkABI: "",
            registrationTimestamp: block.timestamp,
            owner: msg.sender,
            currentRegistryBalanceETH: 0,
            accumulatedRegistryETH: 0
        }));
        uint256 registryID = registries.push(registry) - 1;
        _mint(msg.sender, registryID);
        RegistryRegistered(_name, registryContract, msg.sender, registryID);

        return (registryContract, registryID);
    }

     /* function unregisterRegistry(uint256 _registryID)
         external
         whenNotPaused
     {
         require (ERC721BasicToken.ownerOf(_registryID) == msg.sender);
         address registryAddress = registries[_registryID].contractAddress;

         ChaingearRegistrable registryContract = ChaingearRegistrable(registryAddress);
         require(registryContract.owner() == msg.sender);
         require(registryContract.setChaingearMode(msg.sender, false) == false);

         string storage registryName = registries[_registryID].name;
         uint256 registryIndex = allTokensIndex[_registryID];
         uint256 lastRegistryIndex = registries.length.sub(1);
         Registry storage lastRegistry = registries[lastRegistryIndex];

         registries[registryIndex] = lastRegistry;
         delete registries[lastRegistryIndex];
         registries.length--;

         super._burn(msg.sender, _registryID);

         rethink this event
         RegistryUnregistered(msg.sender, registryName);
     } */

     function updateRegistryOwnership(uint256 _registryID, address _newOwner)
         external
         whenNotPaused
     {
         require (ownerOf(_registryID) == msg.sender);

         Registry(registries[_registryID].contractAddress).transferTokenizedOnwerhip(_newOwner);
         registries[_registryID].owner = _newOwner;

         super.removeTokenFrom(msg.sender, _registryID);
         super.addTokenTo(_newOwner, _registryID);

         RegistryTransferred(msg.sender, registries[_registryID].name, _registryID, _newOwner);
     }
}
