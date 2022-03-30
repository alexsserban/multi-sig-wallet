async function main() {
    const TestContract = await ethers.getContractFactory("TestContract");
    const testContract = await TestContract.deploy();

    await testContract.deployed();
    console.log("Test Contract deployed to:", testContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
