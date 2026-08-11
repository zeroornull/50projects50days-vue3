<script setup lang="ts" vapor>
const imgList = reactive<{ active: boolean, url: string }[]>([
  { active: true, url: 'src/assets/imgs/001.webp' },
  { active: false, url: 'src/assets/imgs/002.webp' },
  { active: false, url: 'src/assets/imgs/003.webp' },
  { active: false, url: 'src/assets/imgs/004.webp' },
])

const activeSlide = ref(0)
const bgImgUrl = ref('')

publicFn()

function leftClick() {
  activeSlide.value--

  if (activeSlide.value < 0)
    activeSlide.value = imgList.length - 1

  publicFn()
}

function rightClick() {
  activeSlide.value++

  if (activeSlide.value > imgList.length - 1)
    activeSlide.value = 0

  publicFn()
}

function publicFn() {
  bgImgUrl.value = (imgList[activeSlide.value] as any).url || ''
  imgList.forEach(slide => (slide.active = false))
  ;(imgList[activeSlide.value] as any).active = true
}
</script>

<template>
  <div class="body base_container" :style="{ backgroundImage: `url(${bgImgUrl})` }">
    <div class="slider-container">
      <div
        v-for="({ active, url }) in imgList"
        :key="url"
        class="slide base-main-h" :class="[active ? 'active' : '']"
        :style="{ backgroundImage: `url(${url})` }"
      />

      <button type="button" class="arrow left-arrow" aria-label="上一张图片" @click="leftClick">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>

      <button type="button" class="arrow right-arrow" aria-label="下一张图片" @click="rightClick">
        <i class="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
