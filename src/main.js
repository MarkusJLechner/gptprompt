import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
const app = createApp(App);
app.use(router);
app.mount('#app');
if (!import.meta.hot) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }
}
