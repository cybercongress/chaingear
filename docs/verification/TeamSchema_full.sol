pragma solidity ^0.4.24;

// File: contracts/common/EntryInterface.sol

interface EntryInterface {

    function createEntry(uint256) external;
    function deleteEntry(uint256) external;
    function getEntriesAmount() external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
    function supportsInterface(bytes4 _interfaceId) external view returns (bool);
}

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
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


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
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
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: openzeppelin-solidity/contracts/introspection/ERC165.sol

/**
 * @title ERC165
 * @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
 */
interface ERC165 {

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceId The interface identifier, as specified in ERC-165
   * @dev Interface identification is specified in ERC-165. This function
   * uses less than 30,000 gas.
   */
  function supportsInterface(bytes4 _interfaceId)
    external
    view
    returns (bool);
}

// File: openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol

/**
 * @title SupportsInterfaceWithLookup
 * @author Matt Condon (@shrugs)
 * @dev Implements ERC165 using a lookup table.
 */
contract SupportsInterfaceWithLookup is ERC165 {

  bytes4 public constant InterfaceId_ERC165 = 0x01ffc9a7;
  /**
   * 0x01ffc9a7 ===
   *   bytes4(keccak256('supportsInterface(bytes4)'))
   */

  /**
   * @dev a mapping of interface id to whether or not it's supported
   */
  mapping(bytes4 => bool) internal supportedInterfaces;

  /**
   * @dev A contract implementing SupportsInterfaceWithLookup
   * implement ERC165 itself
   */
  constructor()
    public
  {
    _registerInterface(InterfaceId_ERC165);
  }

  /**
   * @dev implement supportsInterface(bytes4) using a lookup table
   */
  function supportsInterface(bytes4 _interfaceId)
    external
    view
    returns (bool)
  {
    return supportedInterfaces[_interfaceId];
  }

  /**
   * @dev private method for registering an interface
   */
  function _registerInterface(bytes4 _interfaceId)
    internal
  {
    require(_interfaceId != 0xffffffff);
    supportedInterfaces[_interfaceId] = true;
  }
}

// File: contracts/example/TeamSchema.sol

//This is Example of EntryCore (Team's data scheme)
contract TeamSchema is EntryInterface, Ownable, SupportsInterfaceWithLookup {
    
    using SafeMath for uint256;
    
    bytes4 private constant InterfaceId_EntryCore = 0xcf3c2b48;
    /**
     * 0xcf3c2b48 ===
     *   bytes4(keccak256('createEntry(uint256)')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('entriesAmount()'))
     */

    struct Entry {
        string name;
        address gitcoin;
        address payouts;
        string github;
        string telegram;
        string keybase;
    }
    
    mapping(string => bool) private nameUniqIndex;
    
    uint256[] private allTokens;
    
    mapping(uint256 => uint256) private allEntriesIndex;
    
    Entry[] private entries;
    
    modifier entryExists(uint256 _entryID){
        if (_entryID != 0) {
            require(allEntriesIndex[_entryID] != 0);
        } else {
            require(allTokens[0] == 0);
        }
        _;
    }
    
    constructor()
        public
    {
        _registerInterface(InterfaceId_EntryCore);
    }
    
    function() external {} 
    
    function createEntry(
        uint256 _entryID
    )
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            name: "",
            gitcoin: address(0),
            payouts: address(0),
            github: "",
            telegram: "",
            keybase: ""
        }));

        entries.push(m);
        allEntriesIndex[_entryID] = allTokens.length;
        allTokens.push(_entryID);
    }
    
    function readEntry(
        uint256 _entryID
    )
        external
        view
        entryExists(_entryID)
        returns (
            string,
            address,
            address,
            string,
            string,
            string
        )
    {
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        return (
            entries[entryIndex].name,
            entries[entryIndex].gitcoin,
            entries[entryIndex].payouts,
            entries[entryIndex].github,
            entries[entryIndex].telegram,
            entries[entryIndex].keybase
        );
    }

    // Example: you can write methods for earch parameter and update them separetly
    function updateEntry(
        uint256 _entryID,
        string _name,
        address _gitcoin,
        address _payouts,
        string _github,
        string _telegram,
        string _keybase
    )
        external
    {
        // checkEntryOwnership will return
        // if [token exist && msg.sender == tokenOwner] true
        // else [checkEntryOwnership will fail] false
        // require(owner.call(bytes4(keccak256(
        //     "checkEntryOwnership(uint256, address)")),
        //     _entryID,
        //     msg.sender
        // ));
        
        //before we check that value already exist, then set than name used and unset previous value
        // require(nameUniqIndex[_name] == false);
        // nameUniqIndex[_name] = true;
        
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        // string storage lastName = entries[entryIndex].name;
        // nameUniqIndex[lastName] = false;
            
        Entry memory m = (Entry(
        {
            name: _name,
            gitcoin: _gitcoin,
            payouts: _payouts,
            github: _github,
            telegram: _telegram,
            keybase: _keybase
        }));
        entries[entryIndex] = m;
        
        // here we just calling registry with entry ID and set entry updating timestamp
        // require(owner.call(bytes4(keccak256(
        //     "updateEntryTimestamp(uint256)")),
        //     _entryID
        // ));
    }

    function deleteEntry(
        uint256 _entryID
    )
        external
        onlyOwner
    {
        require(entries.length > 0);
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        string storage nameToClear = entries[entryIndex].name;
        nameUniqIndex[nameToClear] = false;
        
        uint256 lastTokenIndex = allTokens.length.sub(1);
        
        uint256 lastToken = allTokens[lastTokenIndex];
        Entry memory lastEntry = entries[lastTokenIndex];
        
        allTokens[entryIndex] = lastToken;
        entries[entryIndex] = lastEntry;
        
        allTokens[lastTokenIndex] = 0;
        delete entries[lastTokenIndex];
        
        allTokens.length--;
        entries.length--;
        
        allEntriesIndex[_entryID] = 0;
        allEntriesIndex[lastTokenIndex] = entryIndex;
    }

    function getEntriesAmount()
        external
        view
        returns (
            uint256
        )
    {
        return entries.length;
    }
    
    function getEntriesIDs()
        external
        view
        returns (
            uint256[]
        )
    {
        return allTokens;
    }
    
}
