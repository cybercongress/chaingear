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

// File: contracts/common/RegistryBasic.sol

contract RegistryBasic {
    
    function createEntry() public payable returns (uint256);
    function transferAdminRights(address _newOnwer) public;
    function deleteEntry(uint256 _entryId) public;
    function transferEntryOwnership(uint256 _entryId, address _newOwner) public;
    function fundEntry(uint256 _entryId) public payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) public;
    function transferOwnership(address _newOwner) public;
    function getSafeBalance() public view returns (uint256);
    function getAdmin() public view returns (address);
    function name() public view returns (string);
    function symbol() public view returns (string);
}

// File: contracts/common/Safe.sol

/**
* @title Safe contract
* @author cyber•Congress
* @dev Allows store etheirs and claim them by owner
* @notice not recommend to use before release!
*/
contract Safe {
    
    /*
    *  Storage
    */

    address public owner;

    /*
    *  Constructor
    */

    /**
    * @dev Constructor of contract, payable
    */
    constructor()
        public
        payable
    {
        owner = msg.sender;
    }

    /*
    *  Public Functions
    */

    /**
    * @dev Allows direct send only by owner.
    */
    function()
        public
        payable
    {
        require(msg.sender == owner);
    }

    /**
    * @dev Allows owner (chaingear) claim funds and transfer them to token-entry owner
    * @param _entryOwner address transfer to, token-entry owner
    * @param _amount uint claimed amount by token-entry owner
    */
    function claim(
        address _entryOwner,
        uint256 _amount
    )
        public
    {
        require(msg.sender == owner);
        _entryOwner.transfer(_amount);
    }

}

// File: openzeppelin-solidity/contracts/lifecycle/Destructible.sol

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

// File: contracts/chaingear/RegistryBase.sol

/**
* @title Contracts which holds logic and struct of data witch describes registry metainformation which
* associated with token, provides views function for registry metainformation.
* @author cyber•Congress
* @notice not recommend to use before release!
*/
//todo rename: we have RegistryBase and RegistryBasic
contract RegistryBase {
    
    /*
    *  Storage
    */

    // @dev Sctruct which describes registry metainformation with balance state and status
    /*
    * @param Registry name string
    * @param Registry contract address
    * @param Registry creator address
    * @param Registry version string
    * @param Registry ABI link string
    * @param Registry creation timestamp uint
    * @param Registry admin address
     */
    struct RegistryMeta {
        /* string name;
        string symbol; */
        address contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        /* address admin; */
        uint256 currentRegistryBalanceETH;
        uint256 accumulatedRegistryETH;
    }
    

    // @dev Array of registries
    RegistryMeta[] internal registries;

	/*
	*  Events
	*/

    // @dev Events witch signals that new Registry registered
    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint registryID
    );

    // @dev Events witch signals that Registry' adminship transferred
    // @notice that also means associated token transferred too
    event RegistryTransferred(
         address caller,
         uint256 registyID,
         address newOwner
    );
    
    // @dev Events witch signals that Registry' unregistered from Chaingear
    // @notice adminship of Registry transfers from Chaingear to Admin
    event RegistryUnregistered(
        address admin,
        string name
    );

	/*
	*  View Functions
	*/

    /**
    * @dev Registy' metainfo getter
    * @param _registryID uint256 Registry ID
    * @return string Registy' name
    * @return address Registy' address
    * @return address Registy' creator address
    * @return string Registy' version 
    * @return uint Registy' creation timestamp
    * @return string Registy' IPFS hash link to JSON with ABI
    * @return address Registy' admin address
    */
    function registryInfo(
        uint256 _registryID
    )
        public
        view
        returns (
            string,
            string,
            address,
            address,
            string,
            uint,
            address
            /* string */
        )
    {
        address contractAddress = registries[_registryID].contractAddress;
        
        return (
            RegistryBasic(contractAddress).name(),
            RegistryBasic(contractAddress).symbol(),
            contractAddress,
            registries[_registryID].creator,
            registries[_registryID].version,
            registries[_registryID].registrationTimestamp,
            RegistryBasic(contractAddress).getAdmin()
            /* registries[_registryID].linkABI */
        );
    }
    
    /**
    * @dev Registy' safe stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy' balance in safe in wei
    * @return uint Registy' total accumulated balance in safe in wei
    */
    function registryBalanceInfo(
        uint256 _registryID
    )
        public
        view
        returns (
            uint256,
            uint256 
        )
    {
        return (
            registries[_registryID].currentRegistryBalanceETH,
            registries[_registryID].accumulatedRegistryETH
        );
    }

    /**
    * @dev Registies amount getter
    * @return uint256 amounts of Registries
    */
    function registriesAmount()
        public
        view
        returns (
            uint256
        )
    {
        return registries.length;
    }
}

// File: contracts/chaingear/ChaingearCore.sol

/**
* @title Chaingear core contract
* @author cyber•Congress
* @dev Storage of core params with setters, getters
* @notice not recommend to use before release!
*/
contract ChaingearCore is RegistryBase, Destructible, Pausable {

	/*
	*  Storage
	*/
    
    mapping(string => bool) internal registryNamesIndex;
    
    mapping(string => bool) internal registrySymbolsIndex;

    // @dev Short Chaingear description, less than 128 symbols
    string internal chaingearDescription;
    
    // @dev Amount that Creator should pay for registry creation
    uint internal registryRegistrationFee;
    
    address internal registrySafe;
    
    // @dev mapping with address of registry creators with different code base of registries
    mapping (string => address) internal registryAddresses;
    
    // @dev mapping with ipfs links to json with ABI of different registries
    mapping (string => string) internal registryABIsLinks;
    
    // @dev mapping description of different registries
    mapping (string => string) internal registryDescriptions;

    /*
    *  Events
    */

    event RegistryFunded(
        uint ID,
        address sender
    );
    
    event RegistryFundsClaimed(
        uint ID,
        address claimer,
        uint amout
    );
    
    /*
    *  Public Functions
    */

    /**
    * @dev Provides funcitonality for adding bytecode different kind of registries
    * @param _nameOfVersions string which represents name of registry type
    * @param _addressRegistryCreator address of registry creator for this version
    * @param _link string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about this registry
    */
    function addRegistryCreatorVersion(
        string _nameOfVersions, 
        address _addressRegistryCreator,
        string _link,
        string _description
    )
        public
        onlyOwner
    {
        // TODO check for uniqueness
        registryAddresses[_nameOfVersions] = _addressRegistryCreator;
        registryABIsLinks[_nameOfVersions] = _link;
        registryDescriptions[_nameOfVersions] = _description;
    }

	/*
	*  External Functions
	*/

    /**
    * @dev Chaingear' registry fee setter
    * @param _newFee uint new amount of fee
    */
    function updateRegistrationFee(
        uint _newFee
    )
        external
        onlyOwner
    {
        registryRegistrationFee = _newFee;
    }

    /**
    * @dev Chaingear' description setter
    * @param _description string new description
    * @notice description should be less than 128 symbols
    */
    function updateDescription(
        string _description
    )
        external
        onlyOwner
    {
        uint len = bytes(_description).length;
        require(len <= 128);

        chaingearDescription = _description;
    }

	/*
	*  View Functions
	*/
    
    /**
    * @dev Provides funcitonality for adding bytecode different kind of registries
    * @param _version address which represents name of registry type
    * @return _addressRegistryCreator address of registry creator for this version
    * @return _link string which represents IPFS hash to JSON with ABI of registry 
    * @return _description string which resprent info about this registry
    */
    function getRegistryCreatorInfo(
        string _version
    ) 
        public
        view
        returns (
            address _addressRegistryCreator,
            string _link,
            string _description
        )
    {
        return(
            registryAddresses[_version],
            registryABIsLinks[_version],
            registryDescriptions[_version]
        );
    }

    /**
    * @dev Chaingear' description getter
    * @return string description of Chaingear
    */
    function getDescription()
        public
        view
        returns (string)
    {
        return chaingearDescription;
    }

    /**
    * @dev Chaingear' registration fee getter
    * @return uint amount of fee in wei
    */
    function getRegistrationFee()
        public
        view
        returns (uint)
    {
        return registryRegistrationFee;
    }
    
    function getSafeBalance()
        public
        view
        returns (uint balance)
    {
        return address(registrySafe).balance;
    }
    
    function getSafe()
        public
        view
        returns (address)
    {
        return registrySafe;
    }
}

// File: contracts/registry/RegistryPermissionControl.sol

/**
* @title Registry permissions control contract
* @author Cyber•Congress
*/
contract RegistryPermissionControl is Pausable {
    
    /*
    *  Storage
    */
    
    address internal admin;
    
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    
    CreateEntryPermissionGroup internal createEntryPermissionGroup;
    
    /*
    *  Modifiers
    */
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyPermissionedToCreateEntries() {
        if (createEntryPermissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        }
        _;
    }
    
    /*
    *  Public functions
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

    function updateCreateEntryPermissionGroup(
        uint8 _createEntryPermissionGroup
    )
        public
        onlyAdmin
    {
        require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);
        createEntryPermissionGroup = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }
    
    /*
    *  View functions
    */
    
    function getAdmin()
        public
        view
        returns (
            address
        )
    {
        return admin;
    }
    
    function getRegistryPermissions()
        public
        view
        returns (
            uint8
        )
    {
        return uint8(createEntryPermissionGroup);
    }
}

// File: contracts/registry/Chaingeareable.sol

/**
* @title Entries processor for Chaingear
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract Chaingeareable is RegistryPermissionControl {
    
    /*
    *  Storage
    */
    
    // @dev initiate entry creation fee uint
    uint internal entryCreationFee;
    // @dev initiate Registry description string
    string internal registryDescription;
    // @dev initiate Registry tags bytes32[]
    bytes32[] internal registryTags;
    // @dev initiate address of entry base
    address internal entriesStorage;
    // @dev initiate link to ABI of entries contract
    string internal linkToABIOfEntriesContract;
    // @dev initiate address of Registry safe
    address internal registrySafe;

    bool internal registryInitStatus;

    /*
    *  Modifiers
    */

    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    event EntryCreated(
        address creator,
        uint entryID
    );

    event EntryChangedOwner(
        uint entryID,
        address newOwner
    );

    event EntryDeleted(
        address owner,
        uint entryID
    );

    event EntryFunded(
        uint entryID,
        address funder
    );

    event EntryFundsClaimed(
        uint entryID,
        address owner,
        uint amount
    );

    /**
    *  External Functions
    */

    /**
    * @dev entry creation fee setter
    * @param _fee uint
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
    * @dev Registry description setter
    * @param _registryDescription string
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
    * @dev add tags for Registry
    * @param _tag bytes32
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
    * @dev Registry tag setter
    * @param _index uint256
    * @param _tag bytes32
    */
    function updateRegistryTag(
        uint256 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        registryTags[_index] = _tag;
    }

    /**
    * @dev remove tag from Registry
    * @param _index uint256
    * @param _tag bytes32
    */
    function removeRegistryTag(
        uint256 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

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
    * @dev entry base address getter
    * @return address of entry base
    */
    function getEntriesStorage()
        public
        view
        returns (
            address
        )
    {
        return entriesStorage;
    }

    /**
    * @dev link to ABI of entries contract getter
    * @return string link to ABI of entries contract
    */
    function getInterfaceEntriesContract()
        public
        view
        returns (
            string
        )
    {
        return linkToABIOfEntriesContract;
    }

    /**
    * @dev Registry balance getter
    * @return uint balance uint
    */
    function getRegistryBalance()
        public
        view
        returns (
            uint
        )
    {
        return address(this).balance;
    }

    /**
    * @dev entry creation fee getter
    * @return uint creation fee uint
    */
    function getEntryCreationFee()
        public
        view
        returns (
            uint
        )
    {
        return entryCreationFee;
    }

    /**
    * @dev Registry description getter
    * @return string description 
    */
    function getRegistryDescription()
        public
        view
        returns (
            string
        )
    {
        return registryDescription;
    }

    /**
    * @dev Registry tags getter
    * @return bytes32[]
    */
    function getRegistryTags()
        public
        view
        returns (
            bytes32[]
        )
    {
        return registryTags;
    }

    /**
    * @dev safe Registry
    * @return address of Registry safe
    */
    function getRegistrySafe()
        public
        view
        returns (
            address
        )
    {
        return registrySafe;
    }
    
    function getRegistryInitStatus()
        public
        view
        returns (
            bool
        )
    {
        return registryInitStatus;
    }
}

// File: contracts/common/EntryBasic.sol

contract EntryBasic {

    function entriesAmount() public view returns (uint256);
    function createEntry() public returns (uint256);
    function deleteEntry(uint256) public;
}

// File: contracts/registry/Registry.sol

contract Registry is RegistryBasic, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */

    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint256 currentEntryBalanceETH;
        uint256 accumulatedOverallEntryETH;
    }
    
    EntryMeta[] internal entriesMeta;

    /*
    *  Constructor
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
    
    /*
    *  Public functions
    */

    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (
            address
        )
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

    /**
    * @dev entry creation
    * @return uint256
    */
    function createEntry()
        public
        registryInitialized
        onlyPermissionedToCreateEntries
        whenNotPaused
        payable
        returns (
            uint256
        )
    {
        require(msg.value == entryCreationFee);
        
        // TODO check for uniqueness for fields (+protected by uniq field gen)
        
        uint256 newEntryId = EntryBasic(entriesStorage).createEntry();
        _mint(msg.sender, newEntryId);
        
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: msg.sender,
            creator: msg.sender,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));
        
        entriesMeta.push(meta);

        emit EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    /**
    * @dev remove entry from the Regisrty
    * @param _entryID uint256
    */
    function deleteEntry(
        uint256 _entryID
    )
        public
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(entriesMeta[_entryID].currentEntryBalanceETH == 0);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        EntryBasic(entriesStorage).deleteEntry(entryIndex);
        _burn(msg.sender, _entryID);
        
        uint256 lastEntryIndex = entriesMeta.length - 1;
        EntryMeta storage lastEntry = entriesMeta[lastEntryIndex];

        entriesMeta[_entryID] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;

        emit EntryDeleted(msg.sender, _entryID);
    }

    /**
    * @dev delegate entry tokenized ownership to new owner
    * @param _entryID uint256
    * @param _newOwner address
    */
    function transferEntryOwnership(
        uint _entryID, 
        address _newOwner
    )
        public
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(_newOwner != 0x0);
        
        entriesMeta[_entryID].owner = _newOwner;

        super.removeTokenFrom(msg.sender, _entryID);
        super.addTokenTo(_newOwner, _entryID);

        emit EntryChangedOwner(_entryID, _newOwner);
    }

    /**
    * @dev entry fund setter
    * @param _entryID uint256
    */
    function fundEntry(
        uint256 _entryID
    )
        public
        registryInitialized
        whenNotPaused
        payable
    {
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);
        entriesMeta[_entryID].accumulatedOverallEntryETH = entriesMeta[_entryID].accumulatedOverallEntryETH.add(msg.value);
        registrySafe.transfer(msg.value);

        emit EntryFunded(_entryID, msg.sender);
    }

    /**
    * @dev entry fund claimer
    * @param _entryID uint256
    * @param _amount uint
    */
    function claimEntryFunds(
        uint256 _entryID, 
        uint _amount
    )
        public
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);
        Safe(registrySafe).claim(msg.sender, _amount);

        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
    }
    
    /*
    *  External functions
    */
    
    function updateEntryTimestamp(
        uint256 _entryID
    ) 
        external
    {
        require(entriesStorage == msg.sender);
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    }
    
    /*
    *  View functions
    */

    /**
    * @dev safe balance getter
    * @return uint
    */
    function getSafeBalance()
        public
        view
        returns (
            uint balance
        )
    {
        return address(registrySafe).balance;
    }
    
    function getEntryMeta(uint256 _entryID)
        public
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
            entriesMeta[_entryID].owner,
            entriesMeta[_entryID].creator,
            entriesMeta[_entryID].createdAt,
            entriesMeta[_entryID].lastUpdateTime,
            entriesMeta[_entryID].currentEntryBalanceETH,
            entriesMeta[_entryID].accumulatedOverallEntryETH
        );
    }
    
    function checkAuth(uint256 _entryID, address _caller)
        public
        view
        returns (
            bool
        )
    {
        require(ownerOf(_entryID) == _caller);
        return true;
    }
    
    function updateName(
        string _name
    )
        public
        onlyAdmin
    {
        name_ = _name;
    }
        
    
}

// File: contracts/chaingear/RegistryCreator.sol

/**
* @title Registry Creator engine
* @author cyber•Congress
* @dev Allows setted Chaingear contract create new Registries via this proxy contract
* @notice not recommend to use before release!
*/
contract RegistryCreator is Ownable {

	/*
	* @dev Storage
	*/

    // @dev Holds address of contract which can call creation, means Chaingear
    address internal builder;

	/*
	* @dev Constructor
	*/

    /**
    * @dev Contructor of RegistryCreators
    * @notice setting 0x0, than whet creating Chaingear pass RegistryCreator address
    * @notice after that need to set up builder, Chaingear address
    */
    constructor()
        public
    {
        builder = 0x0;
    }

	/*
	* @dev External Functions
	*/
    
    /**
    * @dev Disallows direct send by settings a default function without the `payable` flag.
    */
    function() external {
    }

    /**
    * @dev Allows chaingear (builder) create new registry
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @return address of new registry
    */
    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        returns (address newRegistryContract)
    {
        require(msg.sender == builder);

        newRegistryContract = createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );

        return newRegistryContract;
    }

    /**
    * @dev Registry builder setter
    * @param _builder address
    */
    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder = _builder;
    }

	/*
	*  Private Functions
	*/

    /**
    * @dev Private funtcion for new Registry creation
    * @param _benefitiaries address[] array of beneficiaries addresses
    * @param _shares uint256[] array of shares amont ot each beneficiary
    * @param _name string name of Registry and token
    * @param _symbol string symbol of Registry and token
    * @return address of new registry 
    */
    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        private
        returns (address registryContract)
    {
        registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        Registry(registryContract).transferOwnership(msg.sender);

        return registryContract;
    }

	/*
	*  View Functions
	*/

    /**
    * @dev RegistryCreator's builder getter
    * @return address of setted Registry builder (Chaingear contract)
    */
    function getRegistryBuilder()
        public
        view
        returns (
            address
        )
    {
        return builder;
    }
}

// File: contracts/chaingear/Chaingear.sol

/**
* @title Chaingear - the most expensive database
* @author cyber•Congress
* @dev Main metaregistry contract 
* @notice Proof-of-Concept
*/
contract Chaingear is ERC721Token, SplitPaymentChangeable, ChaingearCore {

    using SafeMath for uint256;

    /*
    *  Constructor
    */

	/**
	* @dev Chaingear constructor
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _description string description of Chaingear
	* @param _registrationFee uint Fee for registry creation
	* @param _chaingearName string Chaingear's name
	* @param _chaingearSymbol string Chaingear's NFT symbol
	*/
    constructor(
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        uint _registrationFee,
        string _chaingearName,
        string _chaingearSymbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_chaingearName, _chaingearSymbol)
        public
        payable
    {
        registryRegistrationFee = _registrationFee;
        chaingearDescription = _description;
        registrySafe = new Safe();
    }
    
    /*
    *  Public functions
    */

    /**
    * @dev Add and tokenize registry with specified parameters.
	* @dev Registration fee is required to send with tx.
	* @dev Tx sender become Creator/Admin of Registry, Chaingear become Owner of Registry
    * @param _version version of registry from which Registry will be boostrapped
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares by benefitiary
    * @param _name string, Registry name
    * @param _symbol string, Registry NFT symbol
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, NFT ID
    */
    function registerRegistry(
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        public
        payable
        whenNotPaused
        returns (
            address,
            uint256
        )
    {
        require(registryAddresses[_version] != 0x0);
        require(registryRegistrationFee == msg.value);
        require(registryNamesIndex[_name] == false);
        require(registrySymbolsIndex[_symbol] == false);

        return createRegistry(
            _version,
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
    }

    /**
    * @dev Allows transfer adminship of Registry to new admin
    * @dev Transfer associated token and set admin of registry to new admin
    * @param _registryID uint256 Registry-token ID which rights will be transferred
    * @param _newOwner address Address of new admin
    */
    function updateRegistryOwnership(
        uint256 _registryID,
        address _newOwner
    )
        public
        whenNotPaused
        onlyOwnerOf(_registryID)
    {
        require(_newOwner != 0x0);
        
        address registryAddress = registries[_registryID].contractAddress;
        RegistryBasic(registryAddress).transferAdminRights(_newOwner);
        
        removeTokenFrom(msg.sender, _registryID);
        addTokenTo(_newOwner, _registryID);
        
        emit RegistryTransferred(msg.sender, _registryID, _newOwner);
    }

    /**
    * @dev Allows to unregister Registry from Chaingear
    * @dev Only possible when safe of Registry is empty
    * @dev Burns associated registry token and transfer Registry adminship to current token owner
    * @param _registryID uint256 Registry-token ID
    */
    function unregisterRegistry(
        uint256 _registryID
    )
        public
        whenNotPaused
        onlyOwnerOf(_registryID)
    {        
        address registryAddress = registries[_registryID].contractAddress;
        require(RegistryBasic(registryAddress).getSafeBalance() == 0);

        uint256 registryIndex = allTokensIndex[_registryID];
        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta storage lastRegistry = registries[lastRegistryIndex];

        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;
        
        address currentAdmin = RegistryBasic(registryAddress).getAdmin();
        RegistryBasic(registryAddress).transferOwnership(currentAdmin);

        _burn(msg.sender, _registryID);

        string memory registryName = RegistryBasic(registryAddress).name();
        emit RegistryUnregistered(msg.sender, registryName);
    }
    
    function fundRegistry(
        uint256 _registryID
    )
        public
        whenNotPaused
        payable
    {
        uint256 weiAmount = msg.value;
        registries[_registryID].currentRegistryBalanceETH = registries[_registryID].currentRegistryBalanceETH.add(weiAmount);
        registries[_registryID].accumulatedRegistryETH = registries[_registryID].accumulatedRegistryETH.add(weiAmount);
        registrySafe.transfer(msg.value);

        emit RegistryFunded(_registryID, msg.sender);
    }

    function claimEntryFunds(
        uint256 _registryID,
        uint256 _amount
    )
        public
        whenNotPaused
        onlyOwnerOf(_registryID)
    {
        require(_amount <= registries[_registryID].currentRegistryBalanceETH);
        registries[_registryID].currentRegistryBalanceETH = registries[_registryID].currentRegistryBalanceETH.sub(_amount);
        Safe(registrySafe).claim(msg.sender, _amount);

        emit RegistryFundsClaimed(_registryID, msg.sender, _amount);
    }

    /*
    *  Private functions
    */

    /**
    * @dev Private function for registry creation
    * @dev Pass Registry params and bytecode to RegistryCreator to current builder
    * @param _version version of registry code which added to chaingear
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares
    * @param _name string, Registry name
    * @param _symbol string, Registry symbol
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, same token ID
    */
    function createRegistry(
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        private
        returns (
            address,
            uint256
        )
    {
        address registryContract = RegistryCreator(registryAddresses[_version]).create(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        RegistryBasic(registryContract).transferAdminRights(msg.sender);
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            contractAddress: registryContract,
            creator: msg.sender,
            version: _version,
            linkABI: registryABIsLinks[_version],
            registrationTimestamp: block.timestamp,
            currentRegistryBalanceETH: 0,
            accumulatedRegistryETH: 0
        }));

        uint256 registryID = registries.push(registry) - 1;
        _mint(msg.sender, registryID);
        
        registryNamesIndex[_name] = true;
        registrySymbolsIndex[_symbol] = true;
        
        emit RegistryRegistered(_name, registryContract, msg.sender, registryID);

        return (
            registryContract,
            registryID
        );
    }
    
}
