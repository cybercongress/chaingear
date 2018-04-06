pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract IPFSeable is Ownable {

    string public linkABI_;
    string public linkMeta_;
    string public linkSourceCode_;

    event MetaLinkUpdated (string linkMeta);
    event ABILinkUpdated (string linkABI);
    event SourceLinkUpdated (string linkSource);

    function updateABILink(string _linkABI) external onlyOwner {
        linkABI_ = _linkABI;
        emit ABILinkUpdated(_linkABI);
    }

    function updateMetaLink(string _linkMeta) external onlyOwner {
        linkMeta_ = _linkMeta;
        emit MetaLinkUpdated(_linkMeta);
    }

    function updateSourceLink(string _linkSourceCode) external onlyOwner {
        linkSourceCode_ = _linkSourceCode;
        emit SourceLinkUpdated(_linkSourceCode);
    }
}
