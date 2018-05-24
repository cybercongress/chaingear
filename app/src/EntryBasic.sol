pragma solidity 0.4.24;

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

// File: contracts/common/EntryBasic.sol

contract EntryBasic {

    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint currentEntryBalanceETH;
        uint accumulatedOverallEntryETH;
    }

    function entriesAmount() public view returns (uint256 entryID);

    function createEntry() public returns (uint256 entryID);
    function deleteEntry(uint256 _entryIndex) public;

    function updateEntryOwnership(uint256 _entryID, address _newOwner) public;
    function updateEntryFund(uint256 _entryID, uint256 _amount) public;
    function claimEntryFund(uint256 _entryID, uint256 _amount) public;

    function entryOwnerOf(uint256 _entryID) public view returns (address);
    function creatorOf(uint256 _entryID) public view returns (address);
    function createdAtOf(uint256 _entryID) public view returns (uint);
    function lastUpdateTimeOf(uint256 _entryID) public view returns (uint);
    function currentEntryBalanceETHOf(uint256 _entryID) public view returns (uint);
    function accumulatedOverallEntryETHOf(uint256 _entryID) public view returns (uint);

    function entryMeta(uint256 _entryId)
        public
        view
        returns (address, address, uint, uint, uint, uint)
    {
        return (
            entryOwnerOf(_entryId),
            creatorOf(_entryId),
            createdAtOf(_entryId),
            lastUpdateTimeOf(_entryId),
            currentEntryBalanceETHOf(_entryId),
            accumulatedOverallEntryETHOf(_entryId)
        );
    }

}
