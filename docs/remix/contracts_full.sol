pragma solidity ^0.4.24;

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

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol

/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Basic is ERC165 {

  bytes4 internal constant InterfaceId_ERC721 = 0x80ac58cd;
  /*
   * 0x80ac58cd ===
   *   bytes4(keccak256('balanceOf(address)')) ^
   *   bytes4(keccak256('ownerOf(uint256)')) ^
   *   bytes4(keccak256('approve(address,uint256)')) ^
   *   bytes4(keccak256('getApproved(uint256)')) ^
   *   bytes4(keccak256('setApprovalForAll(address,bool)')) ^
   *   bytes4(keccak256('isApprovedForAll(address,address)')) ^
   *   bytes4(keccak256('transferFrom(address,address,uint256)')) ^
   *   bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
   *   bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))
   */

  bytes4 internal constant InterfaceId_ERC721Exists = 0x4f558e79;
  /*
   * 0x4f558e79 ===
   *   bytes4(keccak256('exists(uint256)'))
   */

  bytes4 internal constant InterfaceId_ERC721Enumerable = 0x780e9d63;
  /**
   * 0x780e9d63 ===
   *   bytes4(keccak256('totalSupply()')) ^
   *   bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
   *   bytes4(keccak256('tokenByIndex(uint256)'))
   */

  bytes4 internal constant InterfaceId_ERC721Metadata = 0x5b5e139f;
  /**
   * 0x5b5e139f ===
   *   bytes4(keccak256('name()')) ^
   *   bytes4(keccak256('symbol()')) ^
   *   bytes4(keccak256('tokenURI(uint256)'))
   */

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 indexed _tokenId
  );
  event Approval(
    address indexed _owner,
    address indexed _approved,
    uint256 indexed _tokenId
  );
  event ApprovalForAll(
    address indexed _owner,
    address indexed _operator,
    bool _approved
  );

  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function exists(uint256 _tokenId) public view returns (bool _exists);

  function approve(address _to, uint256 _tokenId) public;
  function getApproved(uint256 _tokenId)
    public view returns (address _operator);

  function setApprovalForAll(address _operator, bool _approved) public;
  function isApprovedForAll(address _owner, address _operator)
    public view returns (bool);

  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId)
    public;

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
  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  )
    public
    view
    returns (uint256 _tokenId);

  function tokenByIndex(uint256 _index) public view returns (uint256);
}


/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Metadata is ERC721Basic {
  function name() external view returns (string _name);
  function symbol() external view returns (string _symbol);
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
 * from ERC721 asset contracts.
 */
contract ERC721Receiver {
  /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`,
   *  which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
   */
  bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   * after a `safetransfer`. This function MAY throw to revert and reject the
   * transfer. Return of other than the magic value MUST result in the
   * transaction being reverted.
   * Note: the contract address is always the message sender.
   * @param _operator The address which called `safeTransferFrom` function
   * @param _from The address which previously owned the token
   * @param _tokenId The NFT identifier which is being transferred
   * @param _data Additional data with no specified format
   * @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
   */
  function onERC721Received(
    address _operator,
    address _from,
    uint256 _tokenId,
    bytes _data
  )
    public
    returns(bytes4);
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

// File: openzeppelin-solidity/contracts/AddressUtils.sol

/**
 * Utility library of inline functions on addresses
 */
library AddressUtils {

  /**
   * Returns whether the target address is a contract
   * @dev This function will return false if invoked during the constructor of a contract,
   * as the code is not actually created until after the constructor finishes.
   * @param _addr address to check
   * @return whether the target address is a contract
   */
  function isContract(address _addr) internal view returns (bool) {
    uint256 size;
    // XXX Currently there is no better way to check if there is a contract in an address
    // than to check the size of the code at that address.
    // See https://ethereum.stackexchange.com/a/14016/36603
    // for more details about how this works.
    // TODO Check this again before the Serenity release, because all addresses will be
    // contracts then.
    // solium-disable-next-line security/no-inline-assembly
    assembly { size := extcodesize(_addr) }
    return size > 0;
  }

}

// File: openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol

/**
 * @title ERC721 Non-Fungible Token Standard basic implementation
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721BasicToken is SupportsInterfaceWithLookup, ERC721Basic {

  using SafeMath for uint256;
  using AddressUtils for address;

  // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
  // which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
  bytes4 private constant ERC721_RECEIVED = 0x150b7a02;

  // Mapping from token ID to owner
  mapping (uint256 => address) internal tokenOwner;

  // Mapping from token ID to approved address
  mapping (uint256 => address) internal tokenApprovals;

  // Mapping from owner to number of owned token
  mapping (address => uint256) internal ownedTokensCount;

  // Mapping from owner to operator approvals
  mapping (address => mapping (address => bool)) internal operatorApprovals;

  constructor()
    public
  {
    // register the supported interfaces to conform to ERC721 via ERC165
    _registerInterface(InterfaceId_ERC721);
    _registerInterface(InterfaceId_ERC721Exists);
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
   * @param _tokenId uint256 ID of the token to query the existence of
   * @return whether the token exists
   */
  function exists(uint256 _tokenId) public view returns (bool) {
    address owner = tokenOwner[_tokenId];
    return owner != address(0);
  }

  /**
   * @dev Approves another address to transfer the given token ID
   * The zero address indicates there is no approved address.
   * There can only be one approved address per token at a given time.
   * Can only be called by the token owner or an approved operator.
   * @param _to address to be approved for the given token ID
   * @param _tokenId uint256 ID of the token to be approved
   */
  function approve(address _to, uint256 _tokenId) public {
    address owner = ownerOf(_tokenId);
    require(_to != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

    tokenApprovals[_tokenId] = _to;
    emit Approval(owner, _to, _tokenId);
  }

  /**
   * @dev Gets the approved address for a token ID, or zero if no address set
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved for the given token ID
   */
  function getApproved(uint256 _tokenId) public view returns (address) {
    return tokenApprovals[_tokenId];
  }

  /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
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
  function isApprovedForAll(
    address _owner,
    address _operator
  )
    public
    view
    returns (bool)
  {
    return operatorApprovals[_owner][_operator];
  }

  /**
   * @dev Transfers the ownership of a given token ID to another address
   * Usage of this method is discouraged, use `safeTransferFrom` whenever possible
   * Requires the msg sender to be the owner, approved, or operator
   * @param _from current owner of the token
   * @param _to address to receive the ownership of the given token ID
   * @param _tokenId uint256 ID of the token to be transferred
  */
  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    public
  {
    require(isApprovedOrOwner(msg.sender, _tokenId));
    require(_from != address(0));
    require(_to != address(0));

    clearApproval(_from, _tokenId);
    removeTokenFrom(_from, _tokenId);
    addTokenTo(_to, _tokenId);

    emit Transfer(_from, _to, _tokenId);
  }

  /**
   * @dev Safely transfers the ownership of a given token ID to another address
   * If the target address is a contract, it must implement `onERC721Received`,
   * which is called upon a safe transfer, and return the magic value
   * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
   * the transfer is reverted.
   *
   * Requires the msg sender to be the owner, approved, or operator
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
  {
    // solium-disable-next-line arg-overflow
    safeTransferFrom(_from, _to, _tokenId, "");
  }

  /**
   * @dev Safely transfers the ownership of a given token ID to another address
   * If the target address is a contract, it must implement `onERC721Received`,
   * which is called upon a safe transfer, and return the magic value
   * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
   * the transfer is reverted.
   * Requires the msg sender to be the owner, approved, or operator
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
  function isApprovedOrOwner(
    address _spender,
    uint256 _tokenId
  )
    internal
    view
    returns (bool)
  {
    address owner = ownerOf(_tokenId);
    // Disable solium check because of
    // https://github.com/duaraghav8/Solium/issues/175
    // solium-disable-next-line operator-whitespace
    return (
      _spender == owner ||
      getApproved(_tokenId) == _spender ||
      isApprovedForAll(owner, _spender)
    );
  }

  /**
   * @dev Internal function to mint a new token
   * Reverts if the given token ID already exists
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
   * Reverts if the token does not exist
   * @param _tokenId uint256 ID of the token being burned by the msg.sender
   */
  function _burn(address _owner, uint256 _tokenId) internal {
    clearApproval(_owner, _tokenId);
    removeTokenFrom(_owner, _tokenId);
    emit Transfer(_owner, address(0), _tokenId);
  }

  /**
   * @dev Internal function to clear current approval of a given token ID
   * Reverts if the given address is not indeed the owner of the token
   * @param _owner owner of the token
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function clearApproval(address _owner, uint256 _tokenId) internal {
    require(ownerOf(_tokenId) == _owner);
    if (tokenApprovals[_tokenId] != address(0)) {
      tokenApprovals[_tokenId] = address(0);
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
   * The call is not executed if the target address is not a contract
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
    bytes4 retval = ERC721Receiver(_to).onERC721Received(
      msg.sender, _from, _tokenId, _data);
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
contract ERC721Token is SupportsInterfaceWithLookup, ERC721BasicToken, ERC721 {

  // Token name
  string internal name_;

  // Token symbol
  string internal symbol_;

  // Mapping from owner to list of owned token IDs
  mapping(address => uint256[]) internal ownedTokens;

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
  constructor(string _name, string _symbol) public {
    name_ = _name;
    symbol_ = _symbol;

    // register the supported interfaces to conform to ERC721 via ERC165
    _registerInterface(InterfaceId_ERC721Enumerable);
    _registerInterface(InterfaceId_ERC721Metadata);
  }

  /**
   * @dev Gets the token name
   * @return string representing the token name
   */
  function name() external view returns (string) {
    return name_;
  }

  /**
   * @dev Gets the token symbol
   * @return string representing the token symbol
   */
  function symbol() external view returns (string) {
    return symbol_;
  }

  /**
   * @dev Returns an URI for a given token ID
   * Throws if the token ID does not exist. May return an empty string.
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
  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  )
    public
    view
    returns (uint256)
  {
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
   * Reverts if the index is greater or equal to the total number of tokens
   * @param _index uint256 representing the index to be accessed of the tokens list
   * @return uint256 token ID at the given index of the tokens list
   */
  function tokenByIndex(uint256 _index) public view returns (uint256) {
    require(_index < totalSupply());
    return allTokens[_index];
  }

  /**
   * @dev Internal function to set the token URI for a given token
   * Reverts if the token ID does not exist
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

    // To prevent a gap in the array, we store the last token in the index of the token to delete, and
    // then delete the last slot.
    uint256 tokenIndex = ownedTokensIndex[_tokenId];
    uint256 lastTokenIndex = ownedTokens[_from].length.sub(1);
    uint256 lastToken = ownedTokens[_from][lastTokenIndex];

    ownedTokens[_from][tokenIndex] = lastToken;
    // This also deletes the contents at the last position of the array
    ownedTokens[_from].length--;

    // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
    // be zero. Then we can make sure that we will remove _tokenId from the ownedTokens list since we are first swapping
    // the lastToken to the first position, and then dropping the element placed in the last position of the list

    ownedTokensIndex[_tokenId] = 0;
    ownedTokensIndex[lastToken] = tokenIndex;
  }

  /**
   * @dev Internal function to mint a new token
   * Reverts if the given token ID already exists
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
   * Reverts if the token does not exist
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
  constructor(address[] _payees, uint256[] _shares) public payable {
    require(_payees.length == _shares.length);

    for (uint256 i = 0; i < _payees.length; i++) {
      addPayee(_payees[i], _shares[i]);
    }
  }

  /**
   * @dev payable fallback
   */
  function () external payable {}

  /**
   * @dev Claim your share of the balance.
   */
  function claim() public {
    address payee = msg.sender;

    require(shares[payee] > 0);

    uint256 totalReceived = address(this).balance.add(totalReleased);
    uint256 payment = totalReceived.mul(
      shares[payee]).div(
        totalShares).sub(
          released[payee]
    );

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
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
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
    
    address internal admin;
    
    // @dev Holds supported permission to create entries
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    
    CreateEntryPermissionGroup internal permissionGroup;
    
    /*
    *  Constructor
    */
    
    constructor()
        public
    {
        permissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
        admin = owner;
    }
    
    /*
    *  Modifiers
    */
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyPermissionedToCreateEntries() {
        if (permissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        }
        _;
    }
    
    /*
    *  External functions
    */
    
    /**
    * @dev Allows owner (in main workflow - chaingear) transfer admin right
    * @dev if previous admin transfer associated ERC721 token.
    * @param _newAdmin address of new token holder/registry admin
    * @notice triggered by chaingear in main workflow (when registry non-registered from CH) 
    * @notice admin cannot transfer their own right cause right are tokenized and associated with
    * @notice ERC721 token, which logic controls chaingear contract
    */
    function transferAdminRights(
        address _newAdmin
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(_newAdmin != address(0));
        admin = _newAdmin;
    }

    function updateCreateEntryPermissionGroup(
        CreateEntryPermissionGroup _permissionGroup
    )
        external
        onlyAdmin
        whenNotPaused
    {
        require(CreateEntryPermissionGroup.AllUsers >= _permissionGroup);
        permissionGroup = _permissionGroup;
    }
    
    function getAdmin()
        external
        view
        returns (
            address
        )
    {
        return admin;
    }
    
    function getRegistryPermissions()
        external
        view
        returns (
            CreateEntryPermissionGroup
        )
    {
        return permissionGroup;
    }
        
}

// File: contracts/common/EntryInterface.sol

interface EntryInterface {

    function createEntry(uint256) external;
    function deleteEntry(uint256) external;
    function getEntriesAmount() external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
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
    
    address private owner;

    constructor()
        public
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
        require(_entryOwner != address(0));
        
        _entryOwner.transfer(_amount);
    }

    function getOwner()
        external
        view
        returns(
            address
        )
    {
        return owner;
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
    
    using SafeMath for uint256;
    
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
    EntryInterface internal entriesStorage;
    
    // @dev link to IPFS hash to ABI of EntryCore contract
    string internal linkToABIOfEntriesContract;
    
    // @dev address of Registry safe where funds store
    // @notice deployed on creation contract which hold funds
    Safe internal registrySafe;

    // @dev state of was registry initialized with EntryCore or not
    bool internal registryInitStatus;


    constructor() 
        public
    {
        entryCreationFee = 0;
        registrySafe = new Safe();
        registryInitStatus = false;
    }

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
        whenPaused
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
        require(_index < registryTags.length);

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
        require(registryTags.length > 0);
        require(_index < registryTags.length);

        uint256 lastTagIndex = registryTags.length.sub(1);
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
        return address(entriesStorage);
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

// File: contracts/common/RegistryInterface.sol

interface RegistryInterface {
    
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256) external;
    
    function getEntriesStorage() external view returns (address);
    function getEntriesIDs() external view returns (uint256[]);
    
    function fundEntry(uint256) external payable;
    function claimEntryFunds(uint256, uint256) external;
    
    function transferAdminRights(address) external;
    function transferOwnership(address) external;
    
    function getAdmin() external view returns (address);
    function getSafeBalance() external view returns (uint256);
    
    function name() external view returns (string);
    function symbol() external view returns (string);
    function supportsInterface(bytes4) external view returns (bool);
    
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
contract Registry is RegistryInterface, SupportsInterfaceWithLookup, Chaingeareable, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    bytes4 internal constant InterfaceId_EntryCore = 0xcf3c2b48;
    
    bytes4 internal constant InterfaceId_Registry = 0x52dddfe4;
    /*
     * 0x52dddfe4 ===
     *   bytes4(keccak256('createEntry()')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('fundEntry(uint256)')) ^
     *   bytes4(keccak256('claimEntryFunds(uint256, uint256)')) ^
     *   bytes4(keccak256('transferAdminRights(address)')) ^
     *   bytes4(keccak256('transferOwnership(address)')) ^
     *   bytes4(keccak256('getAdmin()')) ^
     *   bytes4(keccak256('getSafeBalance()'))
     */
    

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint256 currentEntryBalanceWei;
        uint256 accumulatedOverallEntryWei;
    }
    
    // @dev Using for token creation, continuous enumeration
    uint256 internal headTokenID;
    
    // @dev Array of associated to entry/token metadata
    EntryMeta[] internal entriesMeta;
    
    // @dev also works as exist(_entryID)
    modifier onlyOwnerOf(uint256 _entryID){
        require(ownerOf(_entryID) == msg.sender);
        _;
    }

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
        SplitPayment(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        _registerInterface(InterfaceId_Registry);
        headTokenID = 0;
    }
    
    function() external payable {}
    
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
        returns (
            uint256
        )
    {
        require(msg.value == entryCreationFee);
        
        EntryMeta memory meta = (EntryMeta(
        {   
            /* solium-disable-next-line security/no-block-members */
            lastUpdateTime: block.timestamp,
            /* solium-disable-next-line security/no-block-members */
            createdAt: block.timestamp,
            creator: msg.sender,
            currentEntryBalanceWei: 0,
            accumulatedOverallEntryWei: 0
        }));
        entriesMeta.push(meta);
        
        uint256 newTokenID = headTokenID;
        super._mint(msg.sender, newTokenID);
        
        emit EntryCreated(
            newTokenID,
            msg.sender
        );
        
        entriesStorage.createEntry(newTokenID);
        headTokenID = headTokenID.add(1);
        return newTokenID;
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
        uint256 entryIndex = allTokensIndex[_entryID];
        require(entriesMeta[entryIndex].currentEntryBalanceWei == 0);
        
        uint256 lastEntryIndex = entriesMeta.length.sub(1);
        EntryMeta memory lastEntry = entriesMeta[lastEntryIndex];
        
        entriesMeta[entryIndex] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        super._burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        entriesStorage.deleteEntry(_entryID);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        registryInitialized
        whenNotPaused
    {
        super.transferFrom(
            _from,
            _to,
            _tokenId
        );
    }  
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        registryInitialized
        whenNotPaused
    {
        super.safeTransferFrom(
            _from,
            _to,
            _tokenId,
            ""
        );
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    )
        public
        registryInitialized
        whenNotPaused
    {
        transferFrom(_from, _to, _tokenId);
        /* solium-disable-next-line indentation */
        require(checkAndCallSafeTransfer(
            _from,
            _to,
            _tokenId,
            _data
        ));
    }

    /**
    * @dev Allows anyone fund specified entry
    * @param _entryID uint256 Entry-token ID
    * @notice Funds tracks in EntryMeta, stores in Registry Safe
    * @notice Anyone may fund any existing entry
    */
    function fundEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        whenNotPaused
        payable
    {
        require(exists(_entryID) == true);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        uint256 currentWei = entriesMeta[entryIndex].currentEntryBalanceWei.add(msg.value);
        entriesMeta[entryIndex].currentEntryBalanceWei = currentWei;
        
        uint256 accumulatedWei = entriesMeta[entryIndex].accumulatedOverallEntryWei.add(msg.value);
        entriesMeta[entryIndex].accumulatedOverallEntryWei = accumulatedWei;
        
        emit EntryFunded(
            _entryID,
            msg.sender,
            msg.value
        );
        
        address(registrySafe).transfer(msg.value);
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
        uint256 entryIndex = allTokensIndex[_entryID];
        
        uint256 currentWei = entriesMeta[entryIndex].currentEntryBalanceWei;
        require(_amount <= currentWei);
        entriesMeta[entryIndex].currentEntryBalanceWei = currentWei.sub(_amount);
        
        emit EntryFundsClaimed(
            _entryID,
            msg.sender,
            _amount
        );
        
        registrySafe.claim(msg.sender, _amount);
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
        require(entriesStorage == msg.sender);
        /* solium-disable-next-line security/no-block-members */
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    }
    
    /*
    *  View functions
    */
    
    function readEntryMeta(
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
            entriesMeta[_entryID].currentEntryBalanceWei,
            entriesMeta[_entryID].accumulatedOverallEntryWei
        );
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
    
    /**
    * @dev Verification function which auth user to update specified entry in EntryCore
    * @param _entryID uint256 Entry-token ID
    * @param _caller address of caller which trying to update entry throught EntryCore 
    */
    function checkEntryOwnership(
        uint256 _entryID,
        address _caller
    )
        external
        view
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
        require(registryInitStatus == false);
        address deployedAddress;

        //// [review] It is better not to use assembly/arbitrary bytecode as it is very unsafe!
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            //// [review] I am the EntryCore 'owner'
            deployedAddress := create(0, p, s)
        }

        require(deployedAddress != address(0));
        // require(deployedAddress.supportsInterface(InterfaceId_EntryCore));
        
        entriesStorage = EntryInterface(deployedAddress);
        registryInitStatus = true;
        linkToABIOfEntriesContract = _linkToABIOfEntriesContract;
        
        return deployedAddress;
    }
    
}

// File: openzeppelin-solidity/contracts/lifecycle/Destructible.sol

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is Ownable {
  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() public onlyOwner {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) public onlyOwner {
    selfdestruct(_recipient);
  }
}

// File: contracts/RegistryCreator/RegistryBuilderInterface.sol

interface RegistryBuilderInterface {
    
    function createRegistry(
        address[],
        uint256[],
        string,
        string
    ) external returns (RegistryInterface);
}

// File: contracts/chaingear/ChaingearCore.sol

/**
* @title Chaingear core contract
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Holds registry builders data/logic and basic chaingear params
* @notice not recommend to use before release!
*/

contract ChaingearCore is Pausable, Destructible {

	/*
	*  Storage
	*/

    // @dev Sctruct which describes RegistryBuilder, includes IPFS links to registry ABI
    struct RegistryBuilder {
        RegistryBuilderInterface builderAddress;
        string linkToABI;
        string description;
    }
    
    mapping (string => RegistryBuilder) internal buildersVersion;

    Safe internal chaingearSafe;

    string internal chaingearDescription;
    
    uint256 internal registryRegistrationFee;
    
    /*
    *  External Functions
    */

    /**
    * @dev Provides funcitonality for adding builders of different kind of registries
    * @param _version string which represents name of registry type/version
    * @param _builderAddress RegistryBuilderInterface address of registry builder/fabric
    * @param _linkToABI string which represents IPFS hash to JSON with ABI of registry 
    * @param _description string which resprent info about registry fabric type
    * @notice Only owner of metaregistry/chaingear allowed to add builders
    */
    function addRegistryBuilderVersion(
        string _version, 
        RegistryBuilderInterface _builderAddress,
        string _linkToABI,
        string _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(buildersVersion[_version].builderAddress == address(0));
        
        buildersVersion[_version] = (RegistryBuilder(
        {
            builderAddress: _builderAddress,
            linkToABI: _linkToABI,
            description: _description
        }));
    }

    function updateRegistrationFee(
        uint256 _newFee
    )
        external
        onlyOwner
        whenPaused
    {
        registryRegistrationFee = _newFee;
    }

    function updateDescription(
        string _description
    )
        external
        onlyOwner
        whenNotPaused
    {
        uint len = bytes(_description).length;
        require(len <= 256);

        chaingearDescription = _description;
    }

	/*
	*  View Functions
	*/
    
    /**
    * @dev Allows get information about given version of registry builder and registry
    * @param _version String which represents name of given registry type
    * @return address of registry fabric for this version
    * @return string which represents IPFS hash to JSON with ABI of registry 
    * @return string which represents info about this registry 
    */
    function getRegistryBuilder(
        string _version
    ) 
        external
        view
        returns (
            address,
            string,
            string
        )
    {
        return(
            buildersVersion[_version].builderAddress,
            buildersVersion[_version].linkToABI,
            buildersVersion[_version].description
        );
    }

    function getDescription()
        external
        view
        returns (
            string
        )
    {
        return chaingearDescription;
    }

    function getRegistrationFee()
        external
        view
        returns (
            uint256
        )
    {
        return registryRegistrationFee;
    }
    
    function getSafeBalance()
        external
        view
        returns (
            uint256
        )
    {
        return address(chaingearSafe).balance;
    }
    
    function getSafe()
        external
        view
        returns (
            address
        )
    {
        return chaingearSafe;
    }
}

// File: contracts/chaingear/Chaingear.sol

/**
* @title Chaingear - the most expensive database
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Main metaregistry contract 
* @notice Proof-of-Concept. Chaingear it's a metaregistry/fabric for Creator Curated Registries
* @notice where each registry are ERC721.
* @notice not recommend to use before release!
*/
contract Chaingear is ChaingearCore, SupportsInterfaceWithLookup, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    // @dev Sctruct which describes registry metainformation and balance state and status
    struct RegistryMeta {
        RegistryInterface contractAddress;
        address creator;
        string version;
        string linkABI;
        uint registrationTimestamp;
        uint256 currentRegistryBalanceWei;
        uint256 accumulatedRegistryWei;
    }
    
    RegistryMeta[] internal registries;
    // @dev ID can only increase, globally, deletion don't trigger this pointer decreasing
    uint256 internal headTokenID;
    // @dev Mapping which allow control of registries symbols uniqueness in metaregistry
    mapping(string => bool) internal registrySymbolsIndex;
    
    // @dev Interfaces which newly created Registry should support
    bytes4 internal constant InterfaceId_Registry = 0x52dddfe4;
    bytes4 internal constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 internal constant InterfaceId_ERC721Metadata = 0x5b5e139f;
    bytes4 internal constant InterfaceId_ERC721Enumerable = 0x780e9d63;
    
    /*
    *  Events
    */

    event RegistryRegistered(
        string name,
        address registryAddress,
        address creator,
        uint256 registryID
    );

    event RegistryUnregistered(
        address admin,
        string symbol
    );

    event RegistryFunded(
        uint registryID,
        address sender,
        uint amount
    );
    
    event RegistryFundsClaimed(
        uint registryID,
        address claimer,
        uint amout
    );

    /*
    *  Constructor
    */

	/**
	* @dev Chaingear constructor
    * @param _chaingearName string chaingear's name, uses for chaingear's ERC721
    * @param _chaingearSymbol string chaingear's NFT symbol, uses for chaingear's ERC721
	* @param _benefitiaries address[] addresses of Chaingear benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _description string description of Chaingear
	* @param _registrationFee uint fee for registry creation, in wei
    * @notice Only chaingear contract as owner can trigger eithers transfer to/out from Safe
	*/
    constructor(
        string _chaingearName,
        string _chaingearSymbol,
        address[] _benefitiaries,
        uint256[] _shares,
        string _description,
        uint _registrationFee
    )
        public
        ERC721Token(_chaingearName, _chaingearSymbol)
        SplitPayment(_benefitiaries, _shares)
    {
        registryRegistrationFee = _registrationFee;
        chaingearDescription = _description;
        chaingearSafe = new Safe();
        headTokenID = 0;
    }
    
    function() external payable {}
    
    modifier onlyOwnerOf(uint256 _registryID){
        require(ownerOf(_registryID) == msg.sender);
        _;
    }
    
    /*
    *  External functions
    */

    /**
    * @dev Add and tokenize registry with specified parameters.
	* @dev Registration fee is required to send with tx.
	* @dev Tx sender become Creator/Admin of Registry, Chaingear become Owner of Registry
    * @param _version version of registry from which Registry will be boostrapped
    * @param _benefitiaries address[] addresses of Chaingear benefitiaries
    * @param _shares uint256[] array with amount of shares by benefitiary
    * @param _name string, Registry name, use for registry ERC721
    * @param _symbol string, Registry NFT symbol, use for registry ERC721
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, ERC721 NFT ID
    */
    function registerRegistry(
        string _version,
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        external
        payable
        whenNotPaused
        returns (
            address,
            uint256
        )
    {
        require(buildersVersion[_version].builderAddress != address(0));
        require(registryRegistrationFee == msg.value);
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
    * @dev Allows to unregister Registry from Chaingear
    * @dev Only possible when safe of Registry is empty
    * @dev Burns associated registry token and transfer Registry adminship to current token owner
    * @param _registryID uint256 Registry-token ID
    */
    function unregisterRegistry(
        uint256 _registryID
    )
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {        
        uint256 registryIndex = allTokensIndex[_registryID];
        RegistryInterface registryAddress = registries[registryIndex].contractAddress;
        
        string memory registrySymbol = registryAddress.symbol();
        registrySymbolsIndex[registrySymbol] = false;
        
        require(registryAddress.getSafeBalance() == 0);

        uint256 lastRegistryIndex = registries.length.sub(1);
        RegistryMeta memory lastRegistry = registries[lastRegistryIndex];
        registries[registryIndex] = lastRegistry;
        delete registries[lastRegistryIndex];
        registries.length--;

        super._burn(msg.sender, _registryID);
        emit RegistryUnregistered(
            msg.sender,
            registrySymbol
        );    
        //Sets current admin as owner of registry, transfers full control
        registryAddress.transferOwnership(msg.sender);
    }
    
    /**
    * @dev Gets funding and allocate funds of Registry to Chaingear's Safe
    * @param _registryID uint256 Registry-token ID
    */
    function fundRegistry(
        uint256 _registryID
    )
        external
        whenNotPaused
        payable
    {
        require(exists(_registryID) == true);
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentRegistryBalanceWei.add(msg.value);
        registries[registryIndex].currentRegistryBalanceWei = currentWei;
        
        uint256 accumulatedWei = registries[registryIndex].accumulatedRegistryWei.add(msg.value);
        registries[registryIndex].accumulatedRegistryWei = accumulatedWei;

        emit RegistryFunded(
            _registryID,
            msg.sender,
            msg.value
        );
        
        address(chaingearSafe).transfer(msg.value);
    }

    /**
    * @dev Gets funding and allocate funds of Registry to Safe
    * @param _registryID uint256 Registry-token ID
    * @param _amount uint256 Amount which admin of registry claims
    */
    function claimEntryFunds(
        uint256 _registryID,
        uint256 _amount
    )
        external
        onlyOwnerOf(_registryID)
        whenNotPaused
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        
        uint256 currentWei = registries[registryIndex].currentRegistryBalanceWei;
        require(_amount <= currentWei);
        
        registries[registryIndex].currentRegistryBalanceWei = currentWei.sub(_amount);

        emit RegistryFundsClaimed(
            _registryID,
            msg.sender,
            _amount
        );
        
        chaingearSafe.claim(
            msg.sender,
            _amount
        );
    }
    
    /**
    * @dev Registy metainfo getter
    * @param _registryID uint256 Registry ID, associated ERC721 token ID
    * @return string Registy name
    * @return string Registy symbol
    * @return address Registy address
    * @return address Registy creator address
    * @return string Registy version
    * @return uint Registy creation timestamp
    * @return address Registy admin address
    */
    function readRegistry(
        uint256 _registryID
    )
        external
        view
        returns (
            string,
            string,
            address,
            address,
            string,
            uint,
            address
        )
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        RegistryInterface contractAddress = registries[registryIndex].contractAddress;
        
        return (
            contractAddress.name(),
            contractAddress.symbol(),
            contractAddress,
            registries[registryIndex].creator,
            registries[registryIndex].version,
            registries[registryIndex].registrationTimestamp,
            contractAddress.getAdmin()
        );
    }

    /**
    * @dev Registy funding stats getter
    * @param _registryID uint256 Registry ID
    * @return uint Registy current balance in wei, which stored in Safe
    * @return uint Registy total accumulated balance in wei
    */
    function readRegistryBalance(
        uint256 _registryID
    )
        external
        view
        returns (
            uint256,
            uint256 
        )
    {
        uint256 registryIndex = allTokensIndex[_registryID];
        
        return (
            registries[registryIndex].currentRegistryBalanceWei,
            registries[registryIndex].accumulatedRegistryWei
        );
    }
    
    function getRegistriesIDs()
        external
        view
        returns (
            uint256[]
        )
    {
        return allTokens;
    }
    
    /*
    *  Public functions
    */
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        whenNotPaused
    {
        super.transferFrom(
            _from,
            _to,
            _tokenId
        );
        
        uint256 registryIndex = allTokensIndex[_tokenId];
        
        RegistryInterface registryAddress = registries[registryIndex].contractAddress;
        registryAddress.transferAdminRights(_to);
    }  
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        whenNotPaused
    {
        super.safeTransferFrom(
            _from,
            _to,
            _tokenId,
            ""
        );
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    )
        public
        whenNotPaused
    {
        transferFrom(
            _from,
            _to,
            _tokenId
        );
        
        /* solium-disable-next-line indentation*/
        require(checkAndCallSafeTransfer(
            _from,
            _to,
            _tokenId,
            _data
        ));
    }

    /*
    *  Private functions
    */

    /**
    * @dev Private function for registry creation
    * @dev Pass Registry params to RegistryCreator with specified Registry Version
    * @param _version version of registry code which added to chaingear
    * @param _benefitiaries address[] addresses of Registry benefitiaries
    * @param _shares uint256[] array with amount of shares to benefitiaries
    * @param _name string, Registry name, use for registry ERC721
    * @param _symbol string, Registry NFT symbol, use for registry ERC721
    * @return address new Registry contract address
    * @return uint256 new Registry ID in Chaingear contract, ERC721 NFT ID
    * @notice Chaingear sets themself as owner of Registry, creators sets to admin
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
            RegistryInterface,
            uint256
        )
    {   
        RegistryBuilderInterface builder = buildersVersion[_version].builderAddress;
        RegistryInterface registryContract = builder.createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol
        );
        
        require(registryContract.supportsInterface(InterfaceId_Registry));
        require(registryContract.supportsInterface(InterfaceId_ERC721));
        require(registryContract.supportsInterface(InterfaceId_ERC721Metadata));
        require(registryContract.supportsInterface(InterfaceId_ERC721Enumerable));
        
        RegistryMeta memory registry = (RegistryMeta(
        {
            contractAddress: registryContract,
            creator: msg.sender,
            version: _version,
            linkABI: buildersVersion[_version].linkToABI,
            /* solium-disable-next-line security/no-block-members */
            registrationTimestamp: block.timestamp,
            currentRegistryBalanceWei: 0,
            accumulatedRegistryWei: 0
        }));

        registries.push(registry);
        registrySymbolsIndex[_symbol] = true;
        
        uint256 newTokenID = headTokenID;
        headTokenID = headTokenID.add(1);
        
        super._mint(
            msg.sender,
            newTokenID
        );
        
        emit RegistryRegistered(
            _name,
            registryContract,
            msg.sender,
            newTokenID
        );    
        
        registryContract.transferAdminRights(msg.sender);

        return (
            registryContract,
            newTokenID
        );
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
        require(owner.call(bytes4(keccak256(
            "checkEntryOwnership(uint256, address)")),
            _entryID,
            msg.sender
        ));
        
        //before we check that value already exist, then set than name used and unset previous value
        require(nameUniqIndex[_name] == false);
        nameUniqIndex[_name] = true;
        
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        string storage lastName = entries[entryIndex].name;
        nameUniqIndex[lastName] = false;
            
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
        require(owner.call(bytes4(keccak256(
            "updateEntryTimestamp(uint256)")),
            _entryID
        ));
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
