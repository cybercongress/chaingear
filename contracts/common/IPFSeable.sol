pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title IPFSeable contract
* @author cyber•Congress
* @dev Allows store in contract links to files which stored in IPFS 
* @notice not recommend to use before release!
*/
contract IPFSeable is Ownable {

	/*
	*  Storage
	*/
    
    // @dev IPFS hash link to JSON with ABI of contract
    string internal linkABI_;
    
    // @dev IPFS hash link to JSON with metainformation of contract
    string internal linkMeta_;
    
    // @dev IPFS hash link to *.sol of deployed contract
    string internal linkSourceCode_;

	/*
	*  Events
	*/
    
    // @dev Signals that IPFS hask link to meta was updated
    event MetaLinkUpdated (string linkMeta);
    
    // @dev Signals that IPFS hask link to JSON with ABI was updated
    event ABILinkUpdated (string linkABI);
    
    // @dev Signals that IPFS hask link to *.sol with source code was updated
    event SourceLinkUpdated (string linkSource);

	/*
	*  External Functions
	*/

    /**
    * @dev Allows set new link to JSON with contract's ABI
    * @param _linkABI string IPFS hash link to file
    */
    function setABILink(string _linkABI)
        external
        onlyOwner
    {
        linkABI_ = _linkABI;
        emit ABILinkUpdated(_linkABI);
    }

    /**
    * @dev Allows set new link to contract metainformation
    * @param _linkMeta string IPFS hash link to file
    */
    function setMetaLink(string _linkMeta)
        external
        onlyOwner
    {
        linkMeta_ = _linkMeta;
        emit MetaLinkUpdated(_linkMeta);
    }

    /**
    * @dev Allows set new link to source code
    * @param _linkSourceCode string IPFS hash link to file
    */
    function setSourceLink(string _linkSourceCode)
        external
        onlyOwner
    {
        linkSourceCode_ = _linkSourceCode;
        emit SourceLinkUpdated(_linkSourceCode);
    }

    /*
    *  View Functions
    */

    /**
    * @dev getter for IPFS hask link to JSON file with contract's ABI
    * @return string hash to file
    */
    function linkABI()
        public
        view
        returns (string)
    {
        return linkABI_;
    }

    /**
    * @dev getter for IPFS hask link to contract metainformation
    * @return string hash to file
    */
    function linkMeta()
        public
        view
        returns (string)
    {
        return linkMeta_;
    }

    /**
    * @dev getter for IPFS hask link to source code
    * @return string hash to file
    */
    function linkSourceCode()
        public
        view
        returns (string)
    {
        return linkSourceCode_;
    }
}
