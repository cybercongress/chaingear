pragma solidity 0.4.24;

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
    string internal linkABI;
    // @dev IPFS hash link to JSON with metainformation of contract
    string internal linkMeta;
    // @dev IPFS hash link to *.sol of deployed contract
    string internal linkSourceCode;

	/*
	*  Events
	*/

	/*
	*  External Functions
	*/

    /**
    * @dev Allows set new link to JSON with contract's ABI
    * @param _linkABI string IPFS hash link to file
    */
    function setABILink(
        string _linkABI
    )
        external
        onlyOwner
    {
        linkABI = _linkABI;
    }

    /**
    * @dev Allows set new link to contract metainformation
    * @param _linkMeta string IPFS hash link to file
    */
    function setMetaLink(
        string _linkMeta
    )
        external
        onlyOwner
    {
        linkMeta = _linkMeta;
    }

    /**
    * @dev Allows set new link to source code
    * @param _linkSourceCode string IPFS hash link to file
    */
    function setSourceLink(
        string _linkSourceCode
    )
        external
        onlyOwner
    {
        linkSourceCode = _linkSourceCode;
    }

    /*
    *  View Functions
    */

    /**
    * @dev getter for IPFS hask link to JSON file with contract's ABI
    * @return string hash to file
    */
    function getLinkABI()
        public
        view
        returns (
            string
        )
    {
        return linkABI;
    }

    /**
    * @dev getter for IPFS hask link to contract metainformation
    * @return string hash to file
    */
    function getMetaLink()
        public
        view
        returns (
            string
        )
    {
        return linkMeta;
    }

    /**
    * @dev getter for IPFS hask link to source code
    * @return string hash to file
    */
    function getSourceLink()
        public
        view
        returns (
            string
        )
    {
        return linkSourceCode;
    }
}
