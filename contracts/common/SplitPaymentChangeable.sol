pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


//// [review] Added comment:
/**
* @title SplitPaymentChangeable 
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev SplitPayment with ability to change Payee address (by the owner)
*/
contract SplitPaymentChangeable is SplitPayment, Ownable {

    event PayeeAddressChanged(
        uint payeeIndex, 
        address oldAddress, 
        address newAddress
    );

    constructor(
        address[] _payees,
        uint256[] _shares
    )
        public
        payable
        SplitPayment(_payees, _shares)
    { }

    //// [review] Added comment:
    /**
    * @dev 
    * @param _payeeIndex uint Index you would like to change 
    * @param _newAddress address New payee address (an update)
    */
    function changePayeeAddress(
        uint _payeeIndex,
        address _newAddress
    )
        external
	//// [review] BUG: even if you change the ADMIN -> he will not be able to change the payee address
        onlyOwner
    {
	//// [review] BUG: not checking the _payeeIndex!!!
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

	//// [review] BUG: not checking if the oldAddress==newAddress
        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}
