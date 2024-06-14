<script setup lang="ts">
import AudioPlayer from './components/AudioPlayer.vue';
import audio1 from '@/assets/audio/永和路241号 3.m4a';
import audio2 from '@/assets/audio/sample3.mp3';
import defaultImg from '@/assets/imgs/default-cover.svg';
import testImg from '@/assets/imgs/test.jpeg';
import { ref } from 'vue';
const audioList = ref([
  {
    src: audio1,
    name: 'audio1',
    cover: defaultImg
  },
  {
    src: audio2,
    name: 'audio2',
    cover: testImg
  }
]);
const audio = { src: audio1, name: 'audio1', cover: defaultImg };
</script>

<template>
  <div class="content">
    <AudioPlayer :audio-info="audio" :is-list="true" :audio-list="audioList" />
  </div>
</template>

<style scoped>
.content {
  margin-top: 200px;
}
</style>
