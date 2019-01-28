pragma solidity 0.4.25;

import "../common/PaymentSplitter.sol";
import "./DatabasePermissionControl.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract FeeSplitterDatabase is PaymentSplitter, DatabasePermissionControl {
    
    event PayeeAddressChanged(
        uint8 payeeIndex, 
        address oldAddress, 
        address newAddress
    );
    event PayeesDeleted();

    constructor(address[] _payees, uint256[] _shares)
        public
        payable
        PaymentSplitter(_payees, _shares)
    { }
    
    function ()
        external
        payable
        whenNotPaused
    {
        emit PaymentReceived(msg.sender, msg.value);
    }
    
    function changePayeeAddress(uint8 _payeeIndex, address _newAddress)
        external
        whenNotPaused
    {
        require(_payeeIndex < 8);
        require(msg.sender == payees[_payeeIndex]);
        require(payees[_payeeIndex] != _newAddress);
        
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
    
    function setPayess(address[] _payees, uint256[] _shares)
        external
        whenPaused
        onlyAdmin
    {
        _initializePayess(_payees, _shares);
    }
    
    function deletePayees()
        external
        whenPaused
        onlyOwner
    {
        for (uint8 i = 0; i < payees.length; i++) {
            address account = payees[i];
            delete shares[account];
            delete released[account];
        }
        payees.length = 0;
        totalShares = 0;
        totalReleased = 0;
        
        emit PayeesDeleted();
    }
}