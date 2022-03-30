const fs = require("fs");
require("dotenv").config();

async function main() {
    // Local Dev
    // const accounts = await ethers.provider.listAccounts();
    // const owners = [accounts[0], accounts[1], accounts[2]];

    // Rinkeby Dev
    const owners = [process.env.OWNER1, process.env.OWNER2, process.env.OWNER3];

    const NUM_CONFIRMATIONS_REQUIRED = 2;

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(owners, NUM_CONFIRMATIONS_REQUIRED);

    await multiSigWallet.deployed();
    console.log("MultiSigWallet deployed to:", multiSigWallet.address);

    const config = {
        localhost: {
            multiSigWalletAddress: multiSigWallet.address,
        },
    };

    fs.writeFileSync(__dirname + "/../../frontend/config.json", JSON.stringify(config, null, "\t"), "utf-8");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
