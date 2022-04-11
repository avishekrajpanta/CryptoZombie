const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const CryptoZombies = await hre.ethers.getContractFactory('CryptoZombies');
    const cryptoZombies = await CryptoZombies.deploy();
    await cryptoZombies.deployed();

    console.log(`CryptoToken deployed to: ${cryptoZombies.address}`);
    console.log(`Deploying contract with: ${deployer.address} `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
