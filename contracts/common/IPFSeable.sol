pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract IPFSeable is Ownable {

	/*
	*  Storage
	*/

    string internal linkABI_;
    string internal linkMeta_;
    string internal linkSourceCode_;

	/*
	*  Events
	*/

    event MetaLinkUpdated (string linkMeta);
    event ABILinkUpdated (string linkABI);
    event SourceLinkUpdated (string linkSource);

	/*
	*  External Functions
	*/

    function setABILink(string _linkABI)
        external
        onlyOwner
    {
        linkABI_ = _linkABI;
        ABILinkUpdated(_linkABI);
    }

    function setMetaLink(string _linkMeta)
        external
        onlyOwner
    {
        linkMeta_ = _linkMeta;
        MetaLinkUpdated(_linkMeta);
    }

    function setSourceLink(string _linkSourceCode)
        external
        onlyOwner
    {
        linkSourceCode_ = _linkSourceCode;
        SourceLinkUpdated(_linkSourceCode);
    }

    /*
    *  View Functions
    */

    function linkABI()
        public
        view
    returns (string)
    {
        return linkABI_;
    }

    function linkMeta()
        public
        view
    returns (string)
    {
        return linkMeta_;
    }

    function linkSourceCode()
        public
        view
    returns (string)
    {
        return linkSourceCode_;
    }
}
