// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ZombieAttack.sol";
import "./ERC721.sol";

contract ZombieOwnership is ZombieAttack, ERC721 {

    mapping (uint => address) zombieApprovals;

    function balanceOf(address _owner) external view override returns(uint) {
        return ownerZombieCount[_owner];
    }

    function ownerOf(uint _tokenId) external view override returns(address) {
        return zombieToOwner[_tokenId];
    }

    function _transfer(address _from, address _to, uint _tokenId) private {
        ownerZombieCount[_to]++;
        ownerZombieCount[_from]--;
        zombieToOwner[_tokenId] =_to;

        emit Transfer(_from, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint _tokenId) external payable override {
        require(msg.sender == zombieToOwner[_tokenId] || msg.sender == zombieApprovals[_tokenId], 'not owner or approved address');
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint _tokenId) external payable override onlyOwnerOf(_tokenId) { 
        zombieApprovals[_tokenId] = _approved;

        emit Approval(msg.sender, _approved, _tokenId);
    }
}