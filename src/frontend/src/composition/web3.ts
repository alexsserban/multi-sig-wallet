import { reactive, ref } from "vue";
import { ethers } from "ethers";

import MultiSigWallet from "../../artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json";

import Config from "../../config.json";
const config = Config["localhost"];

const getBalanceETH = async (address: string) => {
    const balance = await provider.getBalance(address);
    const remainder = balance.mod(1e14);
    return ethers.utils.formatEther(balance.sub(remainder)) + " ETH";
};

const walletBalance = ref("");
const setWalletBalance = async () => {
    walletBalance.value = await getBalanceETH(wallet.address);
};

const account = reactive({
    address: "0x00",
    balance: "",
});

const setAccountBalance = async () => {
    account.balance = await getBalanceETH(account.address);
};

const setAccount = async (newAccountAddress: string) => {
    account.address = newAccountAddress;
    setAccountBalance();
};

const setBalances = () => {
    setAccountBalance();
    setWalletBalance();
};

let wallet: ethers.Contract;
let provider: ethers.providers.Web3Provider;

if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();
    wallet = new ethers.Contract(config.multiSigWalletAddress, MultiSigWallet.abi, signer);
}

export { wallet, walletBalance, account, provider, setAccount, setWalletBalance, setBalances };
