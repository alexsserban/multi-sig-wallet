<template>
    <div class="text-sm bg-indigo-700 p-4 rounded-lg">
        <div class="has-tooltip">
            <span class="tooltip rounded shadow-lg p-3 bg-indigo-900 text-white -mt-10 -ml-32">
                {{ account.address }}
            </span>

            {{ getShortAddress(account.address) }}
        </div>

        <p>{{ account.balance }}</p>
    </div>

    <div class="mt-12">
        <p class="text-xl font-semibold">Balance: {{ walletBalance }}</p>

        <input
            type="number"
            v-model="depositAmount"
            class="text-black rounded-lg bg-blue-100 w-full mt-2 focus:ring-2"
            placeholder="Amount to deposit (ETH)"
        />

        <button class="mt-4 p-4 bg-blue-600 rounded-lg w-full text-lg" @click="deposit()">Deposit</button>
    </div>

    <div class="mt-12">
        <p class="text-xl font-semibold mb-2">Owners</p>

        <div class="text-sm bg-indigo-700 p-4 rounded-lg">
            <ol>
                <li v-for="(owner, i) in owners" :key="i" class="has-tooltip m-1">
                    <span class="tooltip rounded shadow-lg p-3 bg-indigo-900 text-white -mt-10 -ml-32">
                        {{ owner }}
                    </span>

                    {{ getShortAddress(owner) }}
                </li>
            </ol>
        </div>
        <p class="mt-4">Required confirmations: {{ requiredConfirmations }}</p>
    </div>

    <div class="mt-12 flex justify-center gap-4">
        <div class="w-full">
            <p class="text-xl font-semibold mb-2">Transactions ({{ txCount }})</p>

            <div v-if="transactions.length">
                <div v-for="(tx, i) in transactions" :key="i" class="text-sm bg-indigo-700 rounded-lg mb-4">
                    <div class="p-4">
                        <div class="has-tooltip">
                            <span class="tooltip rounded shadow-lg p-3 bg-indigo-900 text-white -mt-10 -ml-32">
                                {{ tx.to }}
                            </span>

                            To: {{ getShortAddress(tx.to) }}
                        </div>

                        <p>Value: {{ ethers.utils.formatEther(tx.value) + " ETH" }}</p>

                        <p>Data: {{ tx.data }}</p>
                    </div>

                    <div v-if="!tx.executed" class="grid grid-cols-2">
                        <button
                            class="bg-blue-800 rounded-bl-lg py-2 w-full font-semibold"
                            @click="confirmTransaction(i)"
                        >
                            Confirm
                        </button>

                        <button
                            class="bg-blue-900 rounded-br-lg py-2 w-full font-semibold"
                            @click="executeTransaction(i)"
                        >
                            Execute
                        </button>
                    </div>

                    <p v-else class="bg-slate-900 rounded-b-lg py-2 w-full font-semibold hover:cursor-not-allowed">
                        Executed
                    </p>
                </div>
            </div>

            <div v-else><p>No transactions.</p></div>
        </div>

        <div class="w-full">
            <p class="text-xl font-semibold mb-2">Create Transaction</p>

            <div class="flex flex-col">
                <input
                    type="text"
                    v-model="newTransaction.to"
                    class="col-span-3 text-black rounded-lg bg-blue-100 focus:ring-2"
                    placeholder="To"
                />

                <input
                    type="number"
                    v-model="newTransaction.value"
                    class="text-black rounded-lg bg-blue-100 mt-2 focus:ring-2"
                    placeholder="ETH"
                />

                <input
                    type="text"
                    v-model="newTransaction.data"
                    class="col-span-2 text-black rounded-lg bg-blue-100 mt-2 focus:ring-2"
                    placeholder="Data"
                />
            </div>

            <button class="mt-4 p-4 bg-blue-600 rounded-lg w-full text-lg" @click="createTransaction()">Create</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, computed, reactive } from "vue";
import { ethers } from "ethers";

import { account, wallet, walletBalance, setWalletBalance, setBalances } from "../composition/web3";
import notify from "../composition/notify";

const depositAmount = ref("");
const deposit = async () => {
    const tx = await wallet.deposit({ value: ethers.utils.parseEther(depositAmount.value.toString()) });
    const receipt = await tx.wait();
    const { args } = receipt?.events[0];
    const amount = ethers.utils.formatEther(args.amount) + " ETH";
    notify("New deposit", `${amount} deposited`);
    setBalances();
};

const owners = ref([""]);
const requiredConfirmations = ref(0);
let transactions: any = ref([]);

const txCount = computed(() => transactions.value.length);

const getShortAddress = (address: string) => {
    return address.slice(0, 5) + "..." + address.slice(-3);
};

const newTransaction = reactive({
    to: "",
    value: 0,
    data: "",
});

const createTransaction = async () => {
    const tx = await wallet.submitTransaction(
        newTransaction.to,
        ethers.utils.parseEther(newTransaction.value.toString()),
        newTransaction.data
    );
    const receipt = await tx.wait();
    const { args } = receipt?.events[0];

    transactions.value = await wallet.getTransactions();
    notify("New transaction", `Index: ${args.txIndex}`);

    // Reset state
    newTransaction.to = "";
    newTransaction.value = 0;
    newTransaction.data = "";
};

const confirmTransaction = async (index: number) => {
    const tx = await wallet.confirmTransaction(index);
    await tx.wait();
    notify("Transaction Confirmed", "");
};

const executeTransaction = async (index: number) => {
    const tx = await wallet.executeTransaction(index);
    await tx.wait();
    transactions.value = await wallet.getTransactions();
    notify("Transaction Executed", "");
    setWalletBalance();
};

onMounted(async () => {
    setWalletBalance();
    requiredConfirmations.value = await wallet.numConfirmationsRequired();
    owners.value = await wallet.getOwners();
    transactions.value = await wallet.getTransactions();
});
</script>
