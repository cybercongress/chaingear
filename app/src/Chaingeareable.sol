pragma solidity 0.4.19;

// File: contracts/common/ChaingearRegistreable.sol

contract ChaingearRegistreable {


    function register(string _name, address _address) external payable;

}

// File: zeppelin-solidity/contracts/ownership/Ownable.sol

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
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

// File: contracts/common/IPFSeable.sol

contract IPFSeable is Ownable {

    string linkABI;
    string linkMeta;

    event MetaLinkUpdated (string linkMeta);

    function IPFSeable(string _linkABI, string _linkMeta) internal onlyOwner {
        linkABI = _linkABI;
        linkMeta = _linkMeta;
    }

    function updateMetaLink(string _linkMeta) external onlyOwner {
        linkMeta = _linkMeta;
        MetaLinkUpdated(_linkMeta);
    }
}

// File: zeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

// File: zeppelin-solidity/contracts/payment/SplitPayment.sol

/**
 * @title SplitPayment
 * @dev Base contract that supports multiple payees claiming funds sent to this contract
 * according to the proportion they own.
 */
contract SplitPayment {
  using SafeMath for uint256;

  uint256 public totalShares = 0;
  uint256 public totalReleased = 0;

  mapping(address => uint256) public shares;
  mapping(address => uint256) public released;
  address[] public payees;

  /**
   * @dev Constructor
   */
  function SplitPayment(address[] _payees, uint256[] _shares) public {
    require(_payees.length == _shares.length);

    for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }
  }

  /**
   * @dev Add a new payee to the contract.
   * @param _payee The address of the payee to add.
   * @param _shares The number of shares owned by the payee.
   */
  function addPayee(address _payee, uint256 _shares) internal {
    require(_payee != address(0));
    require(_shares > 0);
    require(shares[_payee] == 0);

    payees.push(_payee);
    shares[_payee] = _shares;
    totalShares = totalShares.add(_shares);
  }

  /**
   * @dev Claim your share of the balance.
   */
  function claim() public {
    address payee = msg.sender;

    require(shares[payee] > 0);

    uint256 totalReceived = this.balance.add(totalReleased);
    uint256 payment = totalReceived.mul(shares[payee]).div(totalShares).sub(released[payee]);

    require(payment != 0);
    require(this.balance >= payment);

    released[payee] = released[payee].add(payment);
    totalReleased = totalReleased.add(payment);

    payee.transfer(payment);
  }
}

// File: contracts/common/SplitPaymentChangeable.sol

contract SplitPaymentChangeable is SplitPayment, Ownable {

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

// File: zeppelin-solidity/contracts/lifecycle/Destructible.sol

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is Ownable {

  function Destructible() public payable { }

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() onlyOwner public {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) onlyOwner public {
    selfdestruct(_recipient);
  }
}

// File: zeppelin-solidity/contracts/lifecycle/Pausable.sol

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }
}

// File: contracts/common/Chaingeareable.sol

/* import "zeppelin-solidity/contracts/ownership/Claimable.sol"; */
/* import "zeppelin-solidity/contracts/ownership/Whitelist.sol"; */






contract Chaingeareable is Ownable, Destructible, Pausable, SplitPaymentChangeable {

    string public name_;
    string public description_;
    string public tags_;
    PermissionType public permissionType_;
    uint public entryCreationFee_;

    enum PermissionType {OnlyOwner, AllUsers, Whitelist}

    function Chaingeareable(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee,
        string _name,
        string _description,
        string _tags
    ) SplitPaymentChangeable(_benefitiaries, _shares) public
    {
        permissionType_ = _permissionType;
        entryCreationFee_ = _entryCreationFee;
        name_ = _name;
        description = _description;
        tags_ = _tags;
    }

    function updateEntryCreationFee(uint _fee) external onlyOwner {
        entryCreationFee_ = _fee;
    }

    function updatePermissionType(PermissionType _permissionType) external onlyOwner {
        permissionType_ = _permissionType;
    }

    function updateName(string _name) external onlyOwner {
        uint len = bytes(_name).length;
        require(len > 0 && len <= 32);

        name_ = _name;
    }

    function updateDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        description_ = _description;
    }

    //change to array
    function updateTags(string _tags) external onlyOwner {
        uint len = bytes(_tags).length;
        require(len <= 64);

        tags_ = _tags;
    }

    function registerInChaingear(string _name, address _chaingearAddress) external onlyOwner {
        ChaingearRegistreable chaingear = ChaingearRegistreable(_chaingearAddress);
        chaingear.register(_name, this);
    }
}
