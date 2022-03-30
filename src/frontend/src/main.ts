import { createApp } from "vue";
import App from "./App.vue";
import Notifications from "notiwind";
import "./index.css";

createApp(App).use(Notifications).mount("#app");
