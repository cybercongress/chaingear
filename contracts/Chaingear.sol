pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
/* import "zeppelin-solidity/contracts/ownership/Claimable.sol"; */
/* import "zeppelin-solidity/contracts/ownership/Whitelist.sol"; */
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./common/SplitPaymentChangeable.sol";
import "./common/IPFSeable.sol";

contract Chaingear is Ownable, IPFSeable, Pausable, Destructible, SplitPaymentChangeable {

    struct Registry {
        string name;
        address contractAddress;
        address creator;
        uint registrationTimestamp;
    }

    string public name;
    string public description;
    uint public registrationFee;

    // to think about permissions
    /* enum PermissionType {OnlyOwner, AllUsers, Whitelist} */

    Registry[] public registries;
    event RegistryAdded(string name, address creator, uint entryId);

    function Chaingear(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _description,
        string _linkABI,
        string _linkMeta,
        uint _registrationFee
    ) SplitPaymentChangeable(_benefitiaries, _shares) IPFSeable(_linkABI, _linkMeta) public {
        registrationFee = _registrationFee;
        name = _name;
        description = _description;
    }

    function register(string _name, address _address) external payable {
        require(msg.value == registrationFee);

        registries.push(Registry(
        {
            name: _name,
            contractAddress: _address,
            creator: msg.sender,
            registrationTimestamp: now
        }));

        RegistryAdded(_name, msg.sender, registries.length - 1);
    }

    function registriesAmount() constant public returns (uint) {
        return registries.length;
    }

    function updateRegistrationFee(uint _fee) external onlyOwner {
        registrationFee = _fee;
    }

    function updateName(string _name) external onlyOwner {
        uint len = bytes(_name).length;
        require(len > 0 && len <= 32);

        name = _name;
    }

    function updateDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        description = _description;
    }
}
