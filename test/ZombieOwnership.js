const { inputToConfig } = require('@ethereum-waffle/compiler');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ZombieOwnership Test", async () => {
    let zombieOwnership;
    let alice, bob, sara;

    beforeEach(async () => {
        [alice, bob, sara] = await ethers.getSigners();
        const ZombieOwnership = await ethers.getContractFactory('ZombieOwnership');
        zombieOwnership = await ZombieOwnership.deploy();
        await zombieOwnership.deployed();
    });

    it("Should transfer zombie from owner", async () => {
        const tx = await zombieOwnership.connect(alice).createRandomZombie('Zombie 1');
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId.toNumber();

        expect(await zombieOwnership.connect(alice).transferFrom(alice.address, bob.address, zombieId)).to.emit(zombieOwnership, 'Transfer');
        expect(await zombieOwnership.balanceOf(alice.address)).to.equal(0);
        expect(await zombieOwnership.balanceOf(bob.address)).to.equal(1);
        expect(await zombieOwnership.ownerOf(zombieId)).to.equal(bob.address);
    });

    it("Should transfer zombie from approved address", async () => {
        const tx = await zombieOwnership.connect(alice).createRandomZombie('Zombie 1');
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId.toNumber();

        expect(await zombieOwnership.connect(alice).approve(bob.address, zombieId)).to.emit(zombieOwnership, 'Approval');
        await zombieOwnership.connect(bob).transferFrom(alice.address, sara.address, zombieId);
        expect(await zombieOwnership.balanceOf(alice.address)).to.equal(0);
        expect(await zombieOwnership.balanceOf(sara.address)).to.equal(1);
        expect(await zombieOwnership.ownerOf(zombieId)).to.equal(sara.address);
    });

    it("Throws when trying to transfer zombie from an address that is not owner or approved", async() => {
        const tx = await zombieOwnership.connect(alice).createRandomZombie('Zombie 1');
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId.toNumber();
        await expect(zombieOwnership.connect(bob).transferFrom(alice.address, sara.address, zombieId)).to.be.revertedWith('not owner or approved address');
    });
});