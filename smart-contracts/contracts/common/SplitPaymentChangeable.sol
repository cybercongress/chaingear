pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/payment/SplitPayment.sol";


contract SplitPaymentChangeable is Ownable, SplitPayment {
    
    event PayeeAddressChanged(uint payeeIndex, address oldAddress, address newAddress);

    function SplitPaymentChangeable(address[] _payees, uint256[] _shares)
        SplitPayment(_payees, _shares) public payable
    { }


    function changePayeeAddress(uint _payeeIndex, address _newAddress) external onlyOwner {
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}
