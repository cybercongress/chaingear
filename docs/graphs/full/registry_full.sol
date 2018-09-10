pragma solidity 0.4.24;

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol

/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Basic {
  event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function exists(uint256 _tokenId) public view returns (bool _exists);

  function approve(address _to, uint256 _tokenId) public;
  function getApproved(uint256 _tokenId) public view returns (address _operator);

  function setApprovalForAll(address _operator, bool _approved) public;
  function isApprovedForAll(address _owner, address _operator) public view returns (bool);

  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public;
}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721.sol

/**
 * @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Enumerable is ERC721Basic {
  function totalSupply() public view returns (uint256);
  function tokenOfOwnerByIndex(address _owner, uint256 _index) public view returns (uint256 _tokenId);
  function tokenByIndex(uint256 _index) public view returns (uint256);
}


/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Metadata is ERC721Basic {
  function name() public view returns (string _name);
  function symbol() public view returns (string _symbol);
  function tokenURI(uint256 _tokenId) public view returns (string);
}


/**
 * @title ERC-721 Non-Fungible Token Standard, full implementation interface
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721 is ERC721Basic, ERC721Enumerable, ERC721Metadata {
}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 *  from ERC721 asset contracts.
 */
contract ERC721Receiver {
  /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`,
   *  which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
   */
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   *  after a `safetransfer`. This function MAY throw to revert and reject the
   *  transfer. This function MUST use 50,000 gas or less. Return of other
   *  than the magic value MUST result in the transaction being reverted.
   *  Note: the contract address is always the message sender.
   * @param _from The sending address
   * @param _tokenId The NFT identifier which is being transfered
   * @param _data Additional data with no specified format
   * @return `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
   */
  function onERC721Received(address _from, uint256 _tokenId, bytes _data) public returns(bytes4);
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

// File: openzeppelin-solidity/contracts/AddressUtils.sol

/**
 * Utility library of inline functions on addresses
 */
library AddressUtils {

  /**
   * Returns whether the target address is a contract
   * @dev This function will return false if invoked during the constructor of a contract,
   *  as the code is not actually created until after the constructor finishes.
   * @param addr address to check
   * @return whether the target address is a contract
   */
  function isContract(address addr) internal view returns (bool) {
    uint256 size;
    // XXX Currently there is no better way to check if there is a contract in an address
    // than to check the size of the code at that address.
    // See https://ethereum.stackexchange.com/a/14016/36603
    // for more details about how this works.
    // TODO Check this again before the Serenity release, because all addresses will be
    // contracts then.
    assembly { size := extcodesize(addr) }  // solium-disable-line security/no-inline-assembly
    return size > 0;
  }

}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol

/**
 * @title ERC721 Non-Fungible Token Standard basic implementation
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721BasicToken is ERC721Basic {
  using SafeMath for uint256;
  using AddressUtils for address;

  // Equals to `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
  // which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

  // Mapping from token ID to owner
  mapping (uint256 => address) internal tokenOwner;

  // Mapping from token ID to approved address
  mapping (uint256 => address) internal tokenApprovals;

  // Mapping from owner to number of owned token
  mapping (address => uint256) internal ownedTokensCount;

  // Mapping from owner to operator approvals
  mapping (address => mapping (address => bool)) internal operatorApprovals;

  /**
   * @dev Guarantees msg.sender is owner of the given token
   * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
   */
  modifier onlyOwnerOf(uint256 _tokenId) {
    require(ownerOf(_tokenId) == msg.sender);
    _;
  }

  /**
   * @dev Checks msg.sender can transfer a token, by being owner, approved, or operator
   * @param _tokenId uint256 ID of the token to validate
   */
  modifier canTransfer(uint256 _tokenId) {
    require(isApprovedOrOwner(msg.sender, _tokenId));
    _;
  }

  /**
   * @dev Gets the balance of the specified address
   * @param _owner address to query the balance of
   * @return uint256 representing the amount owned by the passed address
   */
  function balanceOf(address _owner) public view returns (uint256) {
    require(_owner != address(0));
    return ownedTokensCount[_owner];
  }

  /**
   * @dev Gets the owner of the specified token ID
   * @param _tokenId uint256 ID of the token to query the owner of
   * @return owner address currently marked as the owner of the given token ID
   */
  function ownerOf(uint256 _tokenId) public view returns (address) {
    address owner = tokenOwner[_tokenId];
    require(owner != address(0));
    return owner;
  }

  /**
   * @dev Returns whether the specified token exists
   * @param _tokenId uint256 ID of the token to query the existance of
   * @return whether the token exists
   */
  function exists(uint256 _tokenId) public view returns (bool) {
    address owner = tokenOwner[_tokenId];
    return owner != address(0);
  }

  /**
   * @dev Approves another address to transfer the given token ID
   * @dev The zero address indicates there is no approved address.
   * @dev There can only be one approved address per token at a given time.
   * @dev Can only be called by the token owner or an approved operator.
   * @param _to address to be approved for the given token ID
   * @param _tokenId uint256 ID of the token to be approved
   */
  function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    if (getApproved(_tokenId) != address(0) || _to != address(0)) {
      tokenApprovals[_tokenId] = _to;
      emit Approval(owner, _to, _tokenId);
    }
  }

  /**
   * @dev Gets the approved address for a token ID, or zero if no address set
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved for a the given token ID
   */
  function getApproved(uint256 _tokenId) public view returns (address) {
    return tokenApprovals[_tokenId];
  }

  /**
   * @dev Sets or unsets the approval of a given operator
   * @dev An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   */
  function setApprovalForAll(address _to, bool _approved) public {
    require(_to != msg.sender);
    operatorApprovals[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
  }

  /**
   * @dev Tells whether an operator is approved by a given owner
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
    return operatorApprovals[_owner][_operator];
  }

  /**
   * @dev Transfers the ownership of a given token ID to another address
   * @dev Usage of this method is discouraged, use `safeTransferFrom` whenever possible
   * @dev Requires the msg sender to be the owner, approved, or operator
   * @param _from current owner of the token
   * @param _to address to receive the ownership of the given token ID
   * @param _tokenId uint256 ID of the token to be transferred
  */
  function transferFrom(address _from, address _to, uint256 _tokenId) public canTransfer(_tokenId) {
    require(_from != address(0));
    require(_to != address(0));

    clearApproval(_from, _tokenId);
    removeTokenFrom(_from, _tokenId);
    addTokenTo(_to, _tokenId);

    emit Transfer(_from, _to, _tokenId);
  }

  /**
   * @dev Safely transfers the ownership of a given token ID to another address
   * @dev If the target address is a contract, it must implement `onERC721Received`,
   *  which is called upon a safe transfer, and return the magic value
   *  `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`; otherwise,
   *  the transfer is reverted.
   * @dev Requires the msg sender to be the owner, approved, or operator
   * @param _from current owner of the token
   * @param _to address to receive the ownership of the given token ID
   * @param _tokenId uint256 ID of the token to be transferred
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    public
    canTransfer(_tokenId)
  {
    // solium-disable-next-line arg-overflow
    safeTransferFrom(_from, _to, _tokenId, "");
  }

  /**
   * @dev Safely transfers the ownership of a given token ID to another address
   * @dev If the target address is a contract, it must implement `onERC721Received`,
   *  which is called upon a safe transfer, and return the magic value
   *  `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`; otherwise,
   *  the transfer is reverted.
   * @dev Requires the msg sender to be the owner, approved, or operator
   * @param _from current owner of the token
   * @param _to address to receive the ownership of the given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   * @param _data bytes data to send along with a safe transfer check
   */
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public
    canTransfer(_tokenId)
  {
    transferFrom(_from, _to, _tokenId);
    // solium-disable-next-line arg-overflow
    require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data));
  }

  /**
   * @dev Returns whether the given spender can transfer a given token ID
   * @param _spender address of the spender to query
   * @param _tokenId uint256 ID of the token to be transferred
   * @return bool whether the msg.sender is approved for the given token ID,
   *  is an operator of the owner, or is the owner of the token
   */
  function isApprovedOrOwner(address _spender, uint256 _tokenId) internal view returns (bool) {
    address owner = ownerOf(_tokenId);
    return _spender == owner || getApproved(_tokenId) == _spender || isApprovedForAll(owner, _spender);
  }

  /**
   * @dev Internal function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to The address that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function _mint(address _to, uint256 _tokenId) internal {
    require(_to != address(0));
    addTokenTo(_to, _tokenId);
    emit Transfer(address(0), _to, _tokenId);
  }

  /**
   * @dev Internal function to burn a specific token
   * @dev Reverts if the token does not exist
   * @param _tokenId uint256 ID of the token being burned by the msg.sender
   */
  function _burn(address _owner, uint256 _tokenId) internal {
    clearApproval(_owner, _tokenId);
    removeTokenFrom(_owner, _tokenId);
    emit Transfer(_owner, address(0), _tokenId);
  }

  /**
   * @dev Internal function to clear current approval of a given token ID
   * @dev Reverts if the given address is not indeed the owner of the token
   * @param _owner owner of the token
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function clearApproval(address _owner, uint256 _tokenId) internal {
    require(ownerOf(_tokenId) == _owner);
    if (tokenApprovals[_tokenId] != address(0)) {
      tokenApprovals[_tokenId] = address(0);
      emit Approval(_owner, address(0), _tokenId);
    }
  }

  /**
   * @dev Internal function to add a token ID to the list of a given address
   * @param _to address representing the new owner of the given token ID
   * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
   */
  function addTokenTo(address _to, uint256 _tokenId) internal {
    require(tokenOwner[_tokenId] == address(0));
    tokenOwner[_tokenId] = _to;
    ownedTokensCount[_to] = ownedTokensCount[_to].add(1);
  }

  /**
   * @dev Internal function to remove a token ID from the list of a given address
   * @param _from address representing the previous owner of the given token ID
   * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
   */
  function removeTokenFrom(address _from, uint256 _tokenId) internal {
    require(ownerOf(_tokenId) == _from);
    ownedTokensCount[_from] = ownedTokensCount[_from].sub(1);
    tokenOwner[_tokenId] = address(0);
  }

  /**
   * @dev Internal function to invoke `onERC721Received` on a target address
   * @dev The call is not executed if the target address is not a contract
   * @param _from address representing the previous owner of the given token ID
   * @param _to target address that will receive the tokens
   * @param _tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return whether the call correctly returned the expected magic value
   */
  function checkAndCallSafeTransfer(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    internal
    returns (bool)
  {
    if (!_to.isContract()) {
      return true;
    }
    bytes4 retval = ERC721Receiver(_to).onERC721Received(_from, _tokenId, _data);
    return (retval == ERC721_RECEIVED);
  }
}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol

/**
 * @title Full ERC721 Token
 * This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Token is ERC721, ERC721BasicToken {
  // Token name
  string internal name_;

  // Token symbol
  string internal symbol_;

  // Mapping from owner to list of owned token IDs
  mapping (address => uint256[]) internal ownedTokens;

  // Mapping from token ID to index of the owner tokens list
  mapping(uint256 => uint256) internal ownedTokensIndex;

  // Array with all token ids, used for enumeration
  uint256[] internal allTokens;

  // Mapping from token id to position in the allTokens array
  mapping(uint256 => uint256) internal allTokensIndex;

  // Optional mapping for token URIs
  mapping(uint256 => string) internal tokenURIs;

  /**
   * @dev Constructor function
   */
  function ERC721Token(string _name, string _symbol) public {
    name_ = _name;
    symbol_ = _symbol;
  }

  /**
   * @dev Gets the token name
   * @return string representing the token name
   */
  function name() public view returns (string) {
    return name_;
  }

  /**
   * @dev Gets the token symbol
   * @return string representing the token symbol
   */
  function symbol() public view returns (string) {
    return symbol_;
  }

  /**
   * @dev Returns an URI for a given token ID
   * @dev Throws if the token ID does not exist. May return an empty string.
   * @param _tokenId uint256 ID of the token to query
   */
  function tokenURI(uint256 _tokenId) public view returns (string) {
    require(exists(_tokenId));
    return tokenURIs[_tokenId];
  }

  /**
   * @dev Gets the token ID at a given index of the tokens list of the requested owner
   * @param _owner address owning the tokens list to be accessed
   * @param _index uint256 representing the index to be accessed of the requested tokens list
   * @return uint256 token ID at the given index of the tokens list owned by the requested address
   */
  function tokenOfOwnerByIndex(address _owner, uint256 _index) public view returns (uint256) {
    require(_index < balanceOf(_owner));
    return ownedTokens[_owner][_index];
  }

  /**
   * @dev Gets the total amount of tokens stored by the contract
   * @return uint256 representing the total amount of tokens
   */
  function totalSupply() public view returns (uint256) {
    return allTokens.length;
  }

  /**
   * @dev Gets the token ID at a given index of all the tokens in this contract
   * @dev Reverts if the index is greater or equal to the total number of tokens
   * @param _index uint256 representing the index to be accessed of the tokens list
   * @return uint256 token ID at the given index of the tokens list
   */
  function tokenByIndex(uint256 _index) public view returns (uint256) {
    require(_index < totalSupply());
    return allTokens[_index];
  }

  /**
   * @dev Internal function to set the token URI for a given token
   * @dev Reverts if the token ID does not exist
   * @param _tokenId uint256 ID of the token to set its URI
   * @param _uri string URI to assign
   */
  function _setTokenURI(uint256 _tokenId, string _uri) internal {
    require(exists(_tokenId));
    tokenURIs[_tokenId] = _uri;
  }

  /**
   * @dev Internal function to add a token ID to the list of a given address
   * @param _to address representing the new owner of the given token ID
   * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
   */
  function addTokenTo(address _to, uint256 _tokenId) internal {
    super.addTokenTo(_to, _tokenId);
    uint256 length = ownedTokens[_to].length;
    ownedTokens[_to].push(_tokenId);
    ownedTokensIndex[_tokenId] = length;
  }

  /**
   * @dev Internal function to remove a token ID from the list of a given address
   * @param _from address representing the previous owner of the given token ID
   * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
   */
  function removeTokenFrom(address _from, uint256 _tokenId) internal {
    super.removeTokenFrom(_from, _tokenId);

    uint256 tokenIndex = ownedTokensIndex[_tokenId];
    uint256 lastTokenIndex = ownedTokens[_from].length.sub(1);
    uint256 lastToken = ownedTokens[_from][lastTokenIndex];

    ownedTokens[_from][tokenIndex] = lastToken;
    ownedTokens[_from][lastTokenIndex] = 0;
    // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
    // be zero. Then we can make sure that we will remove _tokenId from the ownedTokens list since we are first swapping
    // the lastToken to the first position, and then dropping the element placed in the last position of the list

    ownedTokens[_from].length--;
    ownedTokensIndex[_tokenId] = 0;
    ownedTokensIndex[lastToken] = tokenIndex;
  }

  /**
   * @dev Internal function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function _mint(address _to, uint256 _tokenId) internal {
    super._mint(_to, _tokenId);

    allTokensIndex[_tokenId] = allTokens.length;
    allTokens.push(_tokenId);
  }

  /**
   * @dev Internal function to burn a specific token
   * @dev Reverts if the token does not exist
   * @param _owner owner of the token to burn
   * @param _tokenId uint256 ID of the token being burned by the msg.sender
   */
  function _burn(address _owner, uint256 _tokenId) internal {
    super._burn(_owner, _tokenId);

    // Clear metadata (if any)
    if (bytes(tokenURIs[_tokenId]).length != 0) {
      delete tokenURIs[_tokenId];
    }

    // Reorg all tokens array
    uint256 tokenIndex = allTokensIndex[_tokenId];
    uint256 lastTokenIndex = allTokens.length.sub(1);
    uint256 lastToken = allTokens[lastTokenIndex];

    allTokens[tokenIndex] = lastToken;
    allTokens[lastTokenIndex] = 0;

    allTokens.length--;
    allTokensIndex[_tokenId] = 0;
    allTokensIndex[lastToken] = tokenIndex;
  }

}

// File: openzeppelin-solidity/contracts/payment/SplitPayment.sol

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
  function SplitPayment(address[] _payees, uint256[] _shares) public payable {
    require(_payees.length == _shares.length);

    for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }
  }

  /**
   * @dev payable fallback
   */
  function () public payable {}

  /**
   * @dev Claim your share of the balance.
   */
  function claim() public {
    address payee = msg.sender;

    require(shares[payee] > 0);

    uint256 totalReceived = address(this).balance.add(totalReleased);
    uint256 payment = totalReceived.mul(shares[payee]).div(totalShares).sub(released[payee]);

    require(payment != 0);
    require(address(this).balance >= payment);

    released[payee] = released[payee].add(payment);
    totalReleased = totalReleased.add(payment);

    payee.transfer(payment);
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

// File: contracts/common/SplitPaymentChangeable.sol

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

    function changePayeeAddress(
        uint _payeeIndex,
        address _newAddress
    )
        external
        onlyOwner
    {
        address oldAddress = payees[_payeeIndex];

        shares[_newAddress] = shares[oldAddress];
        released[_newAddress] = released[oldAddress];
        payees[_payeeIndex] = _newAddress;

        delete shares[oldAddress];
        delete released[oldAddress];

        emit PayeeAddressChanged(_payeeIndex, oldAddress, _newAddress);
    }
}

// File: openzeppelin-solidity/contracts/lifecycle/Pausable.sol

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
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    emit Unpause();
  }
}

// File: contracts/registry/RegistryPermissionControl.sol

/**
* @title RegistryPermissionControl contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Controls registry adminship logic and permission to entry management
* @notice Now support only OnlyAdmin/AllUsers permissions
* @notice not recommend to use before release!
*/
contract RegistryPermissionControl is Pausable {
    
    /*
    *  Storage
    */
    
    // @dev 
    address internal admin;
    
    // @dev Holds supported permission to create entry rights
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    
    // @dev Holds current permission group, onlyAdmin by default
    CreateEntryPermissionGroup internal createEntryPermissionGroup;
    
    /*
    *  Modifiers
    */
    
    // @dev Controls access granted only to admin
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    // @dev Controls access to entry creation granted by setted permission group
    modifier onlyPermissionedToCreateEntries() {
        if (createEntryPermissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        }
        _;
    }
    
    /*
    *  View functions
    */
    
    /**
    * @dev Allows to get current admin address account
    * @return address of admin
    */
    function getAdmin()
        external
        view
        returns (address)
    {
        return admin;
    }
    
    /**
    * @dev Allows to get current permission group
    * @return uint8 index of current group
    */
    function getRegistryPermissions()
        external
        view
        returns (uint8)
    {
        return uint8(createEntryPermissionGroup);
    }
    
    /*
    *  Public functions
    */
    
    /**
    * @dev Allows owner (in main workflow - chaingear) transfer admin right
    * @dev if previous admin transfer associated ERC721 token.
    * @param _newAdmin address of new token holder/registry admin
    * @notice triggers by chaingear in main workflow (when registry non-registered from CH) 
    */
    function transferAdminRights(
        address _newAdmin
    )
        public
        onlyOwner
        whenNotPaused
    {
        require(_newAdmin != 0x0);
        admin = _newAdmin;
    }

    /**
    * @dev Allows admin to set new permission group granted to create entries
    * @param _createEntryPermissionGroup uint8 index of needed group
    */
    function updateCreateEntryPermissionGroup(
        uint8 _createEntryPermissionGroup
    )
        public
        onlyAdmin
        whenNotPaused
    {
        require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);
        createEntryPermissionGroup = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }
    
}

// File: contracts/registry/Chaingeareable.sol

/**
* @title Chaingeareable
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Storage of core data and setters/getters
* @notice not recommend to use before release!
*/
contract Chaingeareable is RegistryPermissionControl {
    
    /*
    *  Storage
    */
    
    // @dev entry creation fee 
    uint internal entryCreationFee;
    
    // @dev registry description string
    string internal registryDescription;
    
    // @dev registry tags
    bytes32[] internal registryTags;
    
    // @dev address of EntryCore contract, which specifies data schema and operations
    address internal entriesStorage;
    
    // @dev link to IPFS hash to ABI of EntryCore contract
    string internal linkToABIOfEntriesContract;
    
    // @dev address of Registry safe where funds store
    address internal registrySafe;

    // @dev state of was registry initialized with EntryCore or not
    bool internal registryInitStatus;

    /*
    *  Modifiers
    */

    // @dev don't allow to call registry entry functions before initialization
    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    // @dev Signals that new entry-token added to Registry
    event EntryCreated(
        uint entryID,
        address creator
    );

    // @dev Signals that entry-token changed owner
    event EntryChangedOwner(
        uint entryID,
        address newOwner
    );

    // @dev Signals that entry-token deleted 
    event EntryDeleted(
        uint entryID,
        address owner
    );

    // @dev Signals that entry-token funded with given amount
    event EntryFunded(
        uint entryID,
        address funder,
        uint amount
    );

    // @dev Signals that entry-token funds claimed by owner with given amount
    event EntryFundsClaimed(
        uint entryID,
        address owner,
        uint amount
    );

    /**
    *  External Functions
    */

    /**
    * @dev Allows admin set new registration fee, which entry creators should pay
    * @param _fee uint In wei which should be payed for creation/registration
    */
    function updateEntryCreationFee(
        uint _fee
    )
        external
        onlyAdmin
    {
        entryCreationFee = _fee;
    }

    /**
    * @dev Allows admin update registry description
    * @param _registryDescription string Which represents description
    * @notice Length of description should be less than 256 bytes
    */
    function updateRegistryDescription(
        string _registryDescription
    )
        external
        onlyAdmin
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription = _registryDescription;
    }

    /**
    * @dev Allows admin to add tag to registry
    * @param _tag bytes32 Tag
    * @notice Tags amount should be less than 16
    */
    function addRegistryTag(
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        registryTags.push(_tag);
    }

    /**
    * @dev Allows admin to update update specified tag
    * @param _index uint16 Index of tag to update
    * @param _tag bytes32 New tag value
    */
    function updateRegistryTag(
        uint16 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        require(_index <= registryTags.length-1);

        registryTags[_index] = _tag;
    }

    /**
    * @dev Remove registry tag
    * @param _index uint16 Index of tag to delete
    */
    function removeRegistryTag(
        uint16 _index
    )
        external
        onlyAdmin
    {
        uint256 lastTagIndex = registryTags.length - 1;
        bytes32 lastTag = registryTags[lastTagIndex];

        registryTags[_index] = lastTag;
        registryTags[lastTagIndex] = "";
        registryTags.length--;
    }
    
    /**
    *  View functions
    */

    /**
    * @dev Allows to get EntryCore contract which specified entry schema and operations
    * @return address of that contract
    */
    function getEntriesStorage()
        external
        view
        returns (address)
    {
        return entriesStorage;
    }

    /**
    * @dev Allows to get link interface of EntryCore contract
    * @return string with IPFS hash to JSON with ABI
    */
    function getInterfaceEntriesContract()
        external
        view
        returns (string)
    {
        return linkToABIOfEntriesContract;
    }

    /**
    * @dev Allows to get registry balance which represents accumulated fees for entry creations
    * @return uint Amount in wei accumulated in Registry Contract
    */
    function getRegistryBalance()
        external
        view
        returns (uint)
    {
        return address(this).balance;
    }

    /**
    * @dev Allows to check which amount fee needed for entry creation/registration
    * @return uint Current amount in wei needed for registration
    */
    function getEntryCreationFee()
        external
        view
        returns (uint)
    {
        return entryCreationFee;
    }

    /**
    * @dev Allows to get description of Registry
    * @return string which represents description 
    */
    function getRegistryDescription()
        external
        view
        returns (string)
    {
        return registryDescription;
    }

    /**
    * @dev Allows to get Registry Tags
    * @return bytes32[] array of tags
    */
    function getRegistryTags()
        external
        view
        returns (bytes32[])
    {
        return registryTags;
    }

    /**
    * @dev Allows to get address of Safe which Registry control (owns)
    * @return address of Safe contract
    */
    function getRegistrySafe()
        external
        view
        returns (address)
    {
        return registrySafe;
    }
    
    /**
    * @dev Allows to get amount of funds aggregated in Safe
    * @return uint Amount of funds in wei
    */
    function getSafeBalance()
        external
        view
        returns (uint balance)
    {
        return address(registrySafe).balance;
    }
    
    /**
    * @dev Allows to check state of Registry init with EntryCore
    * @return bool Yes/No
    */
    function getRegistryInitStatus()
        external
        view
        returns (bool)
    {
        return registryInitStatus;
    }
}

// File: contracts/common/EntryInterface.sol

contract EntryInterface {

    function entriesAmount() external view returns (uint256);
    function createEntry() external returns (uint256);
    function deleteEntry(uint256) external;
}

// File: contracts/common/RegistryInterface.sol

contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}

// File: contracts/common/Safe.sol

/**
* @title Safe contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Allows store etheirs which funded to Registry 
* @dev and claim them by Registry/associated token via Chaingear
* @notice not recommend to use before release!
*/
contract Safe {
    
    address public owner;

    constructor()
        public
        payable
    {
        owner = msg.sender;
    }

    /**
    * @dev Allows direct send only by owner.
    */
    function()
        external
        payable
    {
        require(msg.sender == owner);
    }

    /**
    * @dev Allows owner (chaingear) claim funds and transfer them to Registry admin
    * @param _entryOwner address transfer to, Registry-token admin
    * @param _amount uint claimed amount by Registry-token admin
    */
    function claim(
        address _entryOwner,
        uint256 _amount
    )
        external
    {
        require(msg.sender == owner);
        require(_amount <= address(this).balance);
        require(_entryOwner != 0x0);
        _entryOwner.transfer(_amount);
    }

}

// File: contracts/registry/Registry.sol

/**
* @title Registry First Type Contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev This contract in current flow used for Registry creation throught fabric in Chaingear
* @dev Registry creates ERC721 for each entry, entry may be funded/funds claimed
* @dev Admin sets contracts (EntrCore) which defines entry schema
* @dev Entry creation/deletion/update permission are tokenized
* @notice not recommend to use before release!
*/
contract Registry is RegistryInterface, Chaingeareable, SplitPaymentChangeable, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint256 currentEntryBalanceETH;
        uint256 accumulatedOverallEntryETH;
    }
    
    // @dev Array of associated to entry/token metadata
    EntryMeta[] internal entriesMeta;

    /*
    *  Constructor
    */

    /** 
    * @dev Constructor of Registry, creates from fabric which triggers by chaingear
    * @param _benefitiaries address[] addresses of Registry benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _name string Registry name, use for Registry ERC721
	* @param _symbol string Registry NFT symbol, use for Registry ERC721
    * @notice sets default entry creation policy to onlyAdmin
    * @notice sets default creation fee to zero
    * @notice Registry are inactive till he is not initialized with schema (EntryCore)
    */
    constructor(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        createEntryPermissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
        entryCreationFee = 0;
        registrySafe = new Safe();
        registryInitStatus = false;
    }
    
    function() public payable {}
    
    /*
    *  External functions
    */
    
    /**
    * @dev Creates ERC721 and init asscociated epmty entry in EntryCore
    * @return uint256 ID of ERC721 token
    * @notice Entry owner should to after token creation and entry init set
    * @notice entry data throught EntryCore updateEntry() 
    * @notice This (and deletion) would work if EntryCore correctly written
    * @notice otherwise nothing should happen with Registry
    */
    function createEntry()
        external
        registryInitialized
        onlyPermissionedToCreateEntries
        whenNotPaused
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee);
        
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            creator: msg.sender,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));
        
        entriesMeta.push(meta);
        
        //newEntryID equals current entriesAmount number, because token IDs starts from 0
        uint256 newEntryID = EntryInterface(entriesStorage).entriesAmount();
        require(newEntryID == totalSupply());
        
        _mint(msg.sender, newEntryID);
        emit EntryCreated(newEntryID, msg.sender);
        
        uint256 createdEntryID = EntryInterface(entriesStorage).createEntry();
        require(newEntryID == createdEntryID);

        return newEntryID;
    }

    /**
    * @dev Allow entry owner delete Entry-token and also Entry-data in EntryCore
    * @param _entryID uint256 Entry-token ID
    */
    function deleteEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(entriesMeta[_entryID].currentEntryBalanceETH == 0);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        
        uint256 lastEntryIndex = entriesMeta.length - 1;
        EntryMeta storage lastEntry = entriesMeta[lastEntryIndex];

        entriesMeta[_entryID] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        _burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        EntryInterface(entriesStorage).deleteEntry(entryIndex);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        canTransfer(_tokenId)
        registryInitialized
    {
        require(_from != address(0));
        require(_to != address(0));

        clearApproval(_from, _tokenId);
        removeTokenFrom(_from, _tokenId);
        addTokenTo(_to, _tokenId);

        emit Transfer(_from, _to, _tokenId);
    }  

    /**
    * @dev Allows anyone fund specified entry
    * @param _entryID uint256 Entry-token ID
    * @notice Funds tracks in EntryMeta, stores in Registry Safe
    */
    function fundEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        whenNotPaused
        payable
    {
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);
        entriesMeta[_entryID].accumulatedOverallEntryETH = entriesMeta[_entryID].accumulatedOverallEntryETH.add(msg.value);
        emit EntryFunded(_entryID, msg.sender, msg.value);
        
        registrySafe.transfer(msg.value);
    }

    /**
    * @dev Allows entry token owner claim entry funds
    * @param _entryID uint256 Entry-token ID
    * @param _amount uint Amount in wei which token owner claims
    * @notice Funds tracks in EntryMeta, transfers from Safe to claimer (owner)
    */
    function claimEntryFunds(
        uint256 _entryID, 
        uint _amount
    )
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);
        
        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
        
        Safe(registrySafe).claim(msg.sender, _amount);
    }
    
    /**
    * @dev Allow to set last entry data update for entry-token meta
    * @param _entryID uint256 Entry-token ID
    * @notice Can be (should be) called only by EntryCore (updateEntry)
    */
    function updateEntryTimestamp(
        uint256 _entryID
    ) 
        external
    {
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
        require(entriesStorage == msg.sender);
    }
    
    /*
    *  View functions
    */
    
    function getEntryMeta(
        uint256 _entryID
    )
        external
        view
        returns (
            address,
            address,
            uint,
            uint,
            uint256,
            uint256
        )
    {
        return(
            ownerOf(_entryID),
            entriesMeta[_entryID].creator,
            entriesMeta[_entryID].createdAt,
            entriesMeta[_entryID].lastUpdateTime,
            entriesMeta[_entryID].currentEntryBalanceETH,
            entriesMeta[_entryID].accumulatedOverallEntryETH
        );
    }
    
    /**
    * @dev Verification function which auth user to update specified entry data in EntryCore
    * @param _entryID uint256 Entry-token ID
    * @param _caller address of caller which trying to update entry throught EntryCore
    * @return  
    */
    function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
    {
        require(ownerOf(_entryID) == _caller);
    }
    
    /**
    * @dev Allows update ERC721 token name (Registry Name)
    * @param _name string which represents name
    */
    function updateName(
        string _name
    )
        external
        onlyAdmin
    {
        name_ = _name;
    }
    
    /*
    *  Public functions
    */

    /**
    * @dev Registry admin sets generated by them EntryCore contrats with thier schema and 
    * @dev needed supported entry-token logic
    * @param _linkToABIOfEntriesContract string link to IPFS hash which holds EntryCore's ABI
    * @param _entryCore bytes of contract which holds schema and accociated CRUD functions
    * @return address of deployed EntryCore
    */
    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (address)
    {
        address deployedAddress;
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);
        entriesStorage = deployedAddress;
        registryInitStatus = true;
        linkToABIOfEntriesContract = _linkToABIOfEntriesContract;
        
        return entriesStorage;
    }
    
}
