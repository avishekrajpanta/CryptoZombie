const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe("ZombieHelper Test", () => {
    let zombieHelper;
    let alice, bob;

    beforeEach(async () => {
        [alice, bob] = await ethers.getSigners();
        const ZombieHelper = await ethers.getContractFactory("ZombieHelper");
        zombieHelper =  await ZombieHelper.deploy();
        await zombieHelper.deployed();
    });

    it("Should allow to withdraw by owner", async () => {
        const tx = await zombieHelper.connect(alice).withdraw();
        const result = await tx.wait();
        expect(result.status).to.equal(1);
    });

    it("Throws when trying to withdraw by an address that is not owner", async () => {
        await expect(zombieHelper.connect(bob).withdraw()).to.be.reverted;
    });

    it("Should allow to set level up fee by owner", async () => {
        await zombieHelper.connect(alice).setLevelUpFee(ethers.utils.parseEther('0.1'));
        expect(await zombieHelper.levelUpFee()).to.equal(ethers.utils.parseEther('0.1'));
    });

    it("Throws when trying to set level up fee by an address other than owner", async () => {
        await expect(zombieHelper.connect(bob).setLevelUpFee(ethers.utils.parseEther('0.1'))).to.be.reverted;
    });

    it("Should allow to increase zombie's level", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await zombieHelper.levelUp(zombieId, 4, {value: ethers.utils.parseEther('0.004')});
        zombie1Details = await zombieHelper.zombies(zombieId);
        expect(zombie1Details.level).to.equal(4);
    });

    it("Throws when trying to increase zombie's level with insufficent fee", async ()=> {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;
        await expect(zombieHelper.levelUp(zombieId, 3, {value: ethers.utils.parseEther('0.002')})).to.be.revertedWith('Insufficient fee for level upgrade');
    });

    it("Throws when trying to increase level 3 zombie to level 2", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await zombieHelper.levelUp(zombieId, 3, {value: ethers.utils.parseEther('0.003')});
        await expect(zombieHelper.levelUp(zombieId, 2, {value: ethers.utils.parseEther('0.002')})).to.be.revertedWith('Already at this level');
    });

    it("Should allow to change zombie's name", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;
        
        await zombieHelper.levelUp(zombieId, 2, {value: ethers.utils.parseEther("0.002")});
        await zombieHelper.connect(alice).changeName(zombieId, 'New Zombie');
        zombie1Details = await zombieHelper.zombies(zombieId);
        expect(zombie1Details.name).to.equal('New Zombie');
    });

    it("Throws when trying to change name of zombie level 1", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await expect(zombieHelper.connect(alice).changeName(zombieId, 'New Zombie')).to.be.revertedWith('Not enough level');
    });

    it("Throws when trying to change zombie's name without owning it", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await zombieHelper.levelUp(zombieId, 2, {value: ethers.utils.parseEther('0.002')});
        await expect(zombieHelper.connect(bob).changeName(zombieId, 'New Zombie')).to.be.revertedWith('Not owner');
        
    });

    it("Should allow to change dna", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await zombieHelper.connect(alice).levelUp(zombieId, 20, {value: ethers.utils.parseEther('0.02')});
        await zombieHelper.connect(alice).changeDna(zombieId, 12345);
        zombie1Details = await zombieHelper.zombies(zombieId);
        expect(zombie1Details.dna).to.equal(12345);
    });

    it("Throws when trying to change dna of zombie under level 20", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;

        await expect(zombieHelper.connect(alice).changeDna(zombieId, 12345)).to.be.revertedWith('Not enough level');
    });

    it("Should return the zombies belongs to the owner", async () => {
        const tx = await zombieHelper.connect(alice).createRandomZombie('Zombie 1');
        const result = await tx.wait();
        const zombieId = result.events[0].args.zombieId;
        const ownerZombies = await zombieHelper.getZombieByOwner(alice.address);
        expect(ownerZombies[0]).to.equal(zombieId);
    });
});