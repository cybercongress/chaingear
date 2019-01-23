pragma solidity 0.4.25;

import "../common/PaymentSplitter.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract FeeSplitterChaingear is PaymentSplitter, Ownable {
    
    event PayeeAddressChanged(
        uint8 payeeIndex, 
        address oldAddress, 
        address newAddress
    );

    constructor(address[] _payees, uint256[] _shares)
        public
        payable
        PaymentSplitter(_payees, _shares)
    { }
    
    function changePayeeAddress(uint8 _payeeIndex, address _newAddress)
        external
        onlyOwner
    {
        require(_payeeIndex < 12);
        require(payees[_payeeIndex] != _newAddress);
        
        address oldAddress = payees[_payeeIndex];
        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }

}