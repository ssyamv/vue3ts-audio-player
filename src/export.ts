import type { App } from 'vue';
import Vue3AudioPlayer from './components/AudioPlayer.vue';

const install = function (App: App) {
  App.component('Vue3AudioPlayer', Vue3AudioPlayer);
};

export { Vue3AudioPlayer, install };
