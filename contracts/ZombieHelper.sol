// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ZombieFeeding.sol";

contract ZombieHelper is ZombieFeeding {
  
    uint public levelUpFee = 0.001 ether;

    modifier aboveLevel(uint _level, uint _zombieId) {
        require(zombies[_zombieId].level >= _level, 'Not enough level');
        _;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function setLevelUpFee(uint _fee) external onlyOwner {
        levelUpFee = _fee;
    }

    function payFee(uint amount) private {
        require(msg.value >= amount, "Insufficient fee for level upgrade");
    }

    function levelUp(uint _zombieId, uint32 _level) external payable {
        require(_level > zombies[_zombieId].level, 'Already at this level');
        payFee(_level * levelUpFee);
        zombies[_zombieId].level = _level;
    }

    function changeName(uint _zombieId, string calldata _newName) external aboveLevel(2, _zombieId) onlyOwnerOf(_zombieId) {
        zombies[_zombieId].name = _newName;
    }

    function changeDna(uint _zombieId, uint _newDna) external aboveLevel(20, _zombieId) onlyOwnerOf(_zombieId) {
        zombies[_zombieId].dna = _newDna;
    }

    function getZombieByOwner(address _owner) external view returns(uint[] memory) {
        uint[] memory result = new uint[](ownerZombieCount[_owner]);
        uint counter = 0;
        for (uint i = 0; i < zombies.length; i++) {
            if (zombieToOwner[i] == _owner){
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }
    
}