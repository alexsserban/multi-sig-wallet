<template>
    <div class="flex justify-center w-full min-h-screen py-12 bg-gray-800 text-white">
        <Home v-if="hasWallet" />
        <Install v-else />
    </div>

    <AppNotification />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

import AppNotification from "./components/AppNotification.vue";
import Install from "./components/Install.vue";
import Home from "./pages/Home.vue";

import { provider, setAccount } from "./composition/web3";

const hasWallet = computed(() => (window.ethereum ? true : false));

onMounted(async () => {
    if (!hasWallet) return;

    const accounts = await provider.listAccounts();
    setAccount(accounts[0]);

    window.ethereum.on("accountsChanged", (accounts: any) => {
        setAccount(accounts[0]);
        console.log("Account changed to: ", accounts[0]);
    });
});
</script>
