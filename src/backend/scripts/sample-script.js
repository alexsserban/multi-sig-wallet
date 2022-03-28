const hre = require("hardhat");

async function main() {
    const owners = ["", "", ""];
    const numConfirmationsRequired = 2;

    const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(owners, numConfirmationsRequired);

    await multiSigWallet.deployed();

    console.log("MultiSigWallet deployed to:", multiSigWallet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
