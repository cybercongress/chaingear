pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./SplitPaymentChangeable.sol";


/**
 * @title Builder based contract
 */
contract Builder is Destructible, SplitPaymentChangeable {

    /* Building fee  */
    uint public buildingFee;

    /**
     * @dev this event emitted for every builded contract
     */
    event Builded(address client, address instance);
 
    /* Addresses builded contracts at sender */
    mapping(address => address[]) public createdContracts;

    function Builder(address[] _benefitiaries, uint256[] _shares)
        SplitPaymentChangeable(_benefitiaries, _shares) public
    { }
 
    /**
     * @dev Get last address
     * @return last address contract
     */
    function getLastContract() external constant returns (address) {
        var senderContracts = createdContracts[msg.sender];
        return senderContracts[senderContracts.length - 1];
    }

    /**
     * @dev Set building fee
     * @param _buildingFee is fee
     */
    function setBuildingFee(uint _buildingFee) external onlyOwner {
        buildingFee = _buildingFee;
    }
}
