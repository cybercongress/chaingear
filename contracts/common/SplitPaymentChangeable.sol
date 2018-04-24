pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/payment/SplitPayment.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract SplitPaymentChangeable is SplitPayment, Ownable {

    event PayeeAddressChanged(uint payeeIndex, address oldAddress, address newAddress);

    function SplitPaymentChangeable(address[] _payees, uint256[] _shares)
        public
        payable
        SplitPayment(_payees, _shares)
    { }

    function changePayeeAddress(uint _payeeIndex, address _newAddress)
        external
        onlyOwner
    {
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

         PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}
