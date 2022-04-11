const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ZombieFactory Test", () => {
    let zombieFactory;
    let alice, bob;

    beforeEach(async () => {
        [alice, bob] = await ethers.getSigners();
        const ZombieFactory = await ethers.getContractFactory("ZombieFactory");
        zombieFactory =  await ZombieFactory.deploy();
        await zombieFactory.deployed();
    });

    it("Should allow to create a new zombie", async () => {
        const tx = await zombieFactory.connect(alice).createRandomZombie("Zombie 1");
        const result = await tx.wait();
        expect(result.status).to.equal(1);
        expect(result.events[0].args.name).to.equal("Zombie 1");

        const zombieId = result.events[0].args.zombieId.toNumber();
        expect(await zombieFactory.zombieToOwner(zombieId)).to.equal(alice.address);
        expect(await zombieFactory.ownerZombieCount(alice.address)).to.equal(1);
    });

    it("Throws when trying to create two zombies with the same account", async () => {
        expect(await zombieFactory.connect(alice).createRandomZombie("Zombie 1")).to.emit(zombieFactory, 'NewZombie');
        await expect(zombieFactory.connect(alice).createRandomZombie("Zombie 2")).to.be.revertedWith('cannot create zombie twice');
    });
});