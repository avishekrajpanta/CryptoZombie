const { inputToConfig } = require('@ethereum-waffle/compiler');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ZombieAttack Test", async () => {
    let zombieAttack;
    let alice, bob, sara;
    let tx, result;

    beforeEach(async () => {
        [alice, bob, sara] = await ethers.getSigners();
        const ZombieAttack = await ethers.getContractFactory('ZombieAttack');
        zombieAttack = await ZombieAttack.deploy();
        await zombieAttack.deployed();
    });

    it('Should allow to attack another zombie', async () => {
        tx = await zombieAttack.connect(alice).createRandomZombie('Zombie 1');
        result = await tx.wait();
        const firstZombieId = result.events[0].args.zombieId.toNumber();

        tx = await zombieAttack.connect(bob).createRandomZombie('Zombie 2');
        result = await tx.wait();
        const secondZombieId = result.events[0].args.zombieId.toNumber();

        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine");

        tx = await zombieAttack.connect(alice).attack(firstZombieId, secondZombieId);
        result = await tx.wait();
        expect(result.status).to.equal(1);

    });

    it("Throws when trying to attack with the zombie without owning it", async () => {
        tx = await zombieAttack.connect(alice).createRandomZombie('Zombie 1');
        result = await tx.wait();
        const firstZombieId = result.events[0].args.zombieId.toNumber();

        tx = await zombieAttack.connect(bob).createRandomZombie('Zombie 2');
        result = await tx.wait();
        const secondZombieId = result.events[0].args.zombieId.toNumber();

        await expect(zombieAttack.connect(sara).attack(firstZombieId, secondZombieId)).to.be.revertedWith('Not owner');
    })

    it("Throws when trying to re-attack without passing 1 day", async () => {    
        tx = await zombieAttack.connect(alice).createRandomZombie('Zombie 1');
        result = await tx.wait();
        const firstZombieId = result.events[0].args.zombieId.toNumber();

        tx = await zombieAttack.connect(bob).createRandomZombie('Zombie 2');
        result = await tx.wait();
        const secondZombieId = result.events[0].args.zombieId.toNumber();

        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine");

        await zombieAttack.connect(alice).attack(firstZombieId, secondZombieId);
        await expect(zombieAttack.connect(alice).attack(firstZombieId, secondZombieId)).to.be.reverted;
    });     
});