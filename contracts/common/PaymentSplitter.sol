pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title PaymentSplitter
 * @dev This contract can be used when payments need to be received by a group
 * of people and split proportionately to some number of shares they own.
 */
contract PaymentSplitter {
    
    using SafeMath for uint256;

    uint256 internal totalShares;
    uint256 internal totalReleased;

    mapping(address => uint256) internal shares;
    mapping(address => uint256) internal released;
    address[] internal payees;
    
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);

    constructor (address[] _payees, uint256[] _shares)
        public
        payable
    {
        _initializePayess(_payees, _shares);
    }

    function ()
        external
        payable
    {
        emit PaymentReceived(msg.sender, msg.value);
    }

    function getTotalShares()
        external
        view
        returns (uint256)
    {
        return totalShares;
    }

    function getTotalReleased()
        external
        view
        returns (uint256)
    {
        return totalReleased;
    }

    function getShares(address _account)
        external
        view
        returns (uint256)
    {
        return shares[_account];
    }

    function getReleased(address _account)
        external
        view
        returns (uint256)
    {
        return released[_account];
    }

    function getPayee(uint256 _index)
        external
        view
        returns (address)
    {
        return payees[_index];
    }
    
    function getPayeesCount() 
        external
        view
        returns (uint256)
    {   
        return payees.length;
    }

    function release(address _account) 
        public
    {
        require(shares[_account] > 0);

        uint256 totalReceived = address(this).balance.add(totalReleased);
        uint256 payment = totalReceived.mul(shares[_account]).div(totalShares).sub(released[_account]);

        require(payment != 0);

        released[_account] = released[_account].add(payment);
        totalReleased = totalReleased.add(payment);

        _account.transfer(payment);
        
        emit PaymentReleased(_account, payment);
    }
    
    function _initializePayess(address[] _payees, uint256[] _shares)
        internal
    {
        require(payees.length == 0);
        require(_payees.length == _shares.length);
        require(_payees.length > 0 && _payees.length <= 8);

        for (uint256 i = 0; i < _payees.length; i++) {
            _addPayee(_payees[i], _shares[i]);
        }
    }

    function _addPayee(
        address _account,
        uint256 _shares
    ) 
        internal
    {
        require(_account != address(0));
        require(_shares > 0);
        require(shares[_account] == 0);

        payees.push(_account);
        shares[_account] = _shares;
        totalShares = totalShares.add(_shares);
        
        emit PayeeAdded(_account, _shares);
    }
}