// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ERC721 {
    event Transfer(address indexed _from, address indexed _to, uint indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint indexed _tokenId);

    function balanceOf(address _owner) external view returns(uint);
    function ownerOf(uint _tokenId) external view returns(address);
    function transferFrom(address _from, address _to, uint _tokenId) external payable;
    function approve(address _approved, uint _tokenId) external payable;
}