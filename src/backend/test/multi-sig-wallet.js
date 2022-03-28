const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", () => {
    let MultiSigWallet, wallet;
    let owner, addr1, addr2, addrs;
    let walletOwners, walletOwnersAddresses;

    const NUM_CONFIRMATIONS_REQUIRED = 2;

    let tx;

    before(async () => {
        MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    });

    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        walletOwners = [owner, addr1, addr2];

        wallet = await MultiSigWallet.deploy(
            [walletOwners[0].address, walletOwners[1].address, walletOwners[2].address],
            NUM_CONFIRMATIONS_REQUIRED
        );

        await wallet.deployed();
    });

    describe("submit tx", () => {
        it("should submit", async () => {
            const txParams = {
                to: walletOwners[0].address,
                value: 0,
                data: "0x00",
            };

            tx = wallet.connect(walletOwners[0]).submitTransaction(txParams.to, txParams.value, txParams.data);
            await expect(tx)
                .to.emit(wallet, "SubmitTransaction")
                .withArgs(owner.address, 0, txParams.to, txParams.value, txParams.data);
            tx = await wallet.transactions(0);
            expect(tx.executed).to.equal(false);
            expect(tx.numConfirmations).to.equal(0);
        });

        it("should reject for non wallet owners", async () => {
            const txParams = {
                to: walletOwners[0].address,
                value: 0,
                data: "0x00",
            };
            tx = wallet.connect(addrs[0]).submitTransaction(txParams.to, txParams.value, txParams.data);
            await expect(tx).to.be.revertedWith("Not Owner");
        });
    });

    describe("confirm tx", () => {
        beforeEach(async () => {
            await wallet.submitTransaction(walletOwners[0].address, 0, "0x00");
        });

        it("should confirm", async () => {
            tx = wallet.connect(walletOwners[1]).confirmTransaction(0);
            await expect(tx).to.emit(wallet, "ConfirmTransaction").withArgs(walletOwners[1].address, 0);

            tx = await wallet.transactions(0);
            expect(tx.numConfirmations).to.equal(1);
        });

        it("should reject, tx doesn't exist", async () => {
            tx = wallet.connect(walletOwners[1]).confirmTransaction(1);
            await expect(tx).to.be.revertedWith("Tx does not exist");
        });

        it("should reject, tx already executed", async () => {
            await wallet.confirmTransaction(0);
            await wallet.connect(walletOwners[1]).confirmTransaction(0);

            tx = await wallet.executeTransaction(0);

            tx = wallet.connect(walletOwners[1]).confirmTransaction(0);
            await expect(tx).to.be.revertedWith("Tx already executed");
        });

        it("should reject, tx already confirmed", async () => {
            await wallet.confirmTransaction(0);

            tx = wallet.confirmTransaction(0);
            await expect(tx).to.be.revertedWith("Tx already confirmed");
        });
    });

    describe("execute tx", () => {
        beforeEach(async () => {
            await wallet.submitTransaction(walletOwners[0].address, 0, "0x00");
            await wallet.confirmTransaction(0);
            await wallet.connect(walletOwners[1]).confirmTransaction(0);
        });

        it("should execute", async () => {
            tx = wallet.executeTransaction(0);
            await expect(tx).to.emit(wallet, "ExecuteTransaction").withArgs(walletOwners[0].address, 0);

            tx = await wallet.transactions(0);
            expect(tx.executed).to.equal(true);
        });

        it("should reject, tx already executed", async () => {
            tx = await wallet.executeTransaction(0);

            tx = wallet.executeTransaction(0);
            await expect(tx).to.be.revertedWith("Tx already executed");
        });
    });

    describe("revoke confirmation", () => {
        beforeEach(async () => {
            await wallet.submitTransaction(walletOwners[0].address, 0, "0x00");
        });

        it("should revoke", async () => {
            await wallet.confirmTransaction(0);

            tx = wallet.revokeConfirmation(0);
            await expect(tx).to.emit(wallet, "RevokeConfirmation").withArgs(walletOwners[0].address, 0);

            tx = await wallet.transactions(0);
            expect(tx.numConfirmations).to.equal(0);
        });

        it("should reject, not previously confirmed", async () => {
            tx = wallet.revokeConfirmation(0);
            await expect(tx).to.be.revertedWith("Tx not confirmed");
        });
    });
});
