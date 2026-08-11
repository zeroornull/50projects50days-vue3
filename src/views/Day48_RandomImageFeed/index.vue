<script setup lang="ts" vapor>
import { getRandomImg } from '~/api/http'

onMounted(() => getImgList())

const imgList = ref<string[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

async function getImgList() {
  try {
    imgList.value = await getRandomImg()
  }
  catch (error) {
    console.error('Failed to load random images:', error)
    errorMessage.value = '图片加载失败，请稍后重试。'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="body">
    <h1>Random Image Feed</h1>
    <div class="container">
      <p v-if="isLoading" class="status">
        图片加载中...
      </p>
      <p v-else-if="errorMessage" class="status status--error" role="alert">
        {{ errorMessage }}
      </p>
      <template v-if="imgList.length">
        <img
          v-for="(src, index) in imgList"
          :key="src"
          :src
          :alt="`Random image ${index + 1}`"
          height="300"
          loading="lazy"
          width="300"
        >
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
