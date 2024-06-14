<script setup lang="ts">
import playIcon from '@/assets/imgs/play.svg';
import pauseIcon from '@/assets/imgs/pause.svg';
import nextIcon from '@/assets/imgs/next.svg';
import previousIcon from '@/assets/imgs/previous.svg';
import volumeIcon from '@/assets/imgs/volume.svg';
import volumeDisableIcon from '@/assets/imgs/volumeDisable.svg';
import { ref, computed, onMounted, watch } from 'vue';
import defaultCoverImg from '@/assets/imgs/default-cover.svg';
import { ElMessage } from 'element-plus';

type LayoutKey = 'cover' | 'play' | 'volume' | 'progress' | 'next' | 'previous' | 'info';

interface AudioInfo {
  src: string;
  name?: string;
  cover?: string;
}

interface Options {
  layout?: LayoutKey[];
  background?: string;
  defaultCoverImg?: string;
  volume?: number;
  audioInfo?: AudioInfo;
  audioList?: AudioInfo[];
  firstAudioIndex?: number;
  isList?: boolean;
  themeColor?: string;
  showName?: boolean;
}

const props = withDefaults(defineProps<Options>(), {
  background: '#fff',
  layout: () => ['cover', 'info', 'previous', 'play', 'next', 'progress', 'volume'],
  showName: true,
  isList: false,
  audioList: () => [],
  firstAudioIndex: 0,
  volume: 1
});

const previousRef = ref<HTMLImageElement>();
const nextRef = ref<HTMLImageElement>();
const playRef = ref<HTMLImageElement>();
const progressBarRef = ref<HTMLDivElement>();
const infoRef = ref<HTMLDivElement>();
const coverRef = ref<HTMLImageElement>();
const volumeRef = ref<HTMLDivElement>();
const audio = ref(new Audio());
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0);
const isPlaying = ref(false);
const isDragProgress = ref(false);
const currentAudioIndex = ref(props.firstAudioIndex);
const currentAudioInfo = ref<AudioInfo>();

const load = async (src: string) => {
  audio.value.src = src;
  await new Promise((resolve) => {
    audio.value.addEventListener('error', () => {
      ElMessage.error('音频加载失败');
      resolve(false);
    });
    audio.value.addEventListener('loadedmetadata', () => {
      resolve(true);
    });
  });
};

const renderLayout = () => {
  const layout = props.layout;
  layout.forEach((item, index) => {
    switch (item) {
      case 'cover':
        if (coverRef.value) coverRef.value.style.order = `${index}`;
        break;
      case 'info':
        if (infoRef.value) infoRef.value.style.order = `${index}`;
        break;
      case 'progress':
        if (progressBarRef.value) progressBarRef.value.style.order = `${index}`;
        break;
      case 'play':
        if (playRef.value) playRef.value.style.order = `${index}`;
        break;
      case 'next':
        if (props.isList && nextRef.value) {
          nextRef.value.style.order = `${index}`;
        }
        break;
      case 'previous':
        if (props.isList && previousRef.value) {
          previousRef.value.style.order = `${index}`;
        }
        break;
      case 'volume':
        if (volumeRef.value) volumeRef.value.style.order = `${index}`;
        break;
    }
  });
};

const init = async () => {
  audio.value.volume = props.volume;
  if (props.isList && props.audioList.length) {
    await load(props.audioList[currentAudioIndex.value].src);
    currentAudioInfo.value = props.audioList[currentAudioIndex.value];
  } else if (props.audioInfo) {
    await load(props.audioInfo.src);
    currentAudioInfo.value = props.audioInfo;
  }

  currentTime.value = audio.value.currentTime;
  duration.value = audio.value.duration || 0;
  volume.value = audio.value.volume * 100;
  audio.value.addEventListener('timeupdate', () => {
    if (!isDragProgress.value) currentTime.value = audio.value.currentTime;
  });
  audio.value.addEventListener('ended', () => {
    isPlaying.value = false;
  });
};

const formatTime = (time: number) => {
  const min = Math.floor(time / 60);
  const second = parseInt((time % 60) + '');
  return `${min < 10 ? '0' + min : min}:${second < 10 ? '0' + second : second}`;
};

const handlePlay = () => {
  audio.value
    .play()
    .then(() => {
      isPlaying.value = true;
    })
    .catch((error) => {
      ElMessage.error('播放失败');
    });
};

const handlePause = () => {
  audio.value.pause();
  isPlaying.value = false;
};

const setVolume = () => {
  audio.value.volume = volume.value / 100;
};

const playNext = () => {
  currentAudioIndex.value = (currentAudioIndex.value + 1) % props.audioList.length;
  init();
  if (isPlaying.value) handlePlay();
};

const playPrevious = () => {
  currentAudioIndex.value =
    (currentAudioIndex.value - 1 + props.audioList.length) % props.audioList.length;
  init();
  if (isPlaying.value) handlePlay();
};

const changeCurrentTime = () => {
  audio.value.currentTime = currentTime.value;
};

onMounted(() => {
  renderLayout();
  init();
});

watch(
  props,
  () => {
    init();
  },
  { deep: true }
);

defineExpose({});
</script>

<template>
  <div class="audio-player-wrap">
    <img
      :src="currentAudioInfo?.cover || defaultCoverImg"
      class="cover-img"
      ref="coverRef"
      v-if="layout.includes('cover')"
    />
    <div class="audio-info" ref="infoRef" v-if="layout.includes('info')">
      <div class="name" v-if="showName">{{ currentAudioInfo?.name || '未命名' }}</div>
      <div class="time">
        <div class="current">{{ formatTime(currentTime) }}</div>
        <div class="split">/</div>
        <div class="total">{{ formatTime(duration) }}</div>
      </div>
    </div>
    <img
      :src="previousIcon"
      class="control-icon"
      ref="previousRef"
      v-if="layout.includes('previous') && isList"
      @click="playPrevious"
    />
    <img
      v-if="layout.includes('play')"
      :src="isPlaying ? pauseIcon : playIcon"
      @click="() => (isPlaying ? handlePause() : handlePlay())"
      class="control-icon"
      ref="playRef"
    />
    <img
      :src="nextIcon"
      class="control-icon"
      ref="nextRef"
      @click="playNext"
      v-if="layout.includes('next') && isList"
    />
    <div class="progress-bar" ref="progressBarRef" v-if="layout.includes('progress')">
      <el-slider
        v-model="currentTime"
        class="progress-bar-inner"
        :show-tooltip="false"
        :min="0"
        :max="Math.floor(duration)"
        :disabled="!duration"
        @change="changeCurrentTime"
        @mousedown="() => (isDragProgress = true)"
        @mouseup="() => (isDragProgress = false)"
      />
    </div>
    <div class="volume-wrap" ref="volumeRef" v-if="layout.includes('volume')">
      <el-popover
        placement="top"
        trigger="hover"
        width="40px"
        popper-class="vue3-audio-player-volume-popper"
      >
        <el-slider
          v-model="volume"
          class="volume-bar"
          :show-tooltip="false"
          :min="0"
          :max="100"
          @input="setVolume"
          height="100px"
          :vertical="true"
        />
        <template #reference>
          <img :src="volume ? volumeIcon : volumeDisableIcon" class="volume-icon"
        /></template>
      </el-popover>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.audio-player-wrap {
  --player-background: v-bind(background);
  background: var(--player-background);
  height: 50px;
  width: 400px;
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 0px 8px 0px;
  display: flex;
  padding: 10px;
  align-items: center;
  .cover-img {
    height: 50px;
    width: 50px;
    border-radius: 8px;
    object-fit: cover;
  }
  .audio-info {
    font-size: 12px;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 90px;
    }
    .time {
      margin-top: 5px;
      display: flex;
      color: rgb(158, 158, 158);
      .current,
      .total {
        width: 32px;
      }
      .split {
        margin: 0 4px;
      }
    }
  }
  .control-icon {
    & + .control-icon {
      margin-left: 8px;
    }
    height: 20px;
    width: 20px;
    cursor: pointer;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -khtml-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .volume-wrap {
    cursor: pointer;
    .volume-icon {
      height: 20px;
      width: 20px;
      margin-top: 4px;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      -khtml-user-select: none;
      user-select: none;
      -webkit-user-drag: none;
    }
  }
  .progress-bar {
    flex: 1;
    margin: 0 15px 0 10px;
    .progress-bar-inner {
      --el-slider-height: 4px;
      :deep(.el-slider__runway) {
        .el-slider__bar {
          background-color: #f28686;
        }
        .el-slider__button-wrapper {
          --el-slider-button-size: 10px;
          --el-slider-main-bg-color: rgb(242, 134, 134);
          --el-slider-button-wrapper-size: 24px;
          --el-slider-button-wrapper-offset: -11px;
          --el-slider-disabled-color: rgb(242, 134, 134);
          .el-slider__button {
            background-color: var(--el-slider-main-bg-color);
          }
          .hover {
            transform: none;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.vue3-audio-player-volume-popper {
  min-width: 40px !important;
  --el-popover-padding: 0px;
  .volume-bar {
    margin: 8px 0 8px 1px;
    --el-slider-height: 4px;
    .el-slider__runway {
      --el-slider-main-bg-color: rgb(242, 134, 134);
      .el-slider__bar {
      }
      .el-slider__button-wrapper {
        --el-slider-button-size: 10px;
        --el-slider-button-wrapper-size: 24px;
        --el-slider-button-wrapper-offset: -10px;
        .el-slider__button {
          background-color: var(--el-slider-main-bg-color);
        }
        .hover {
          transform: none;
        }
      }
    }
  }
}
</style>
