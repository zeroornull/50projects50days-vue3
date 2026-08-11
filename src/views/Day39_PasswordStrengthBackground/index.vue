<script setup lang="ts" vapor>
const password = ref('')

const backgroundBlur = computed(() => Math.max(20 - password.value.length * 2, 0))
</script>

<template>
  <div class="body base_container">
    <div
      class="background"
      :style="{ filter: `blur(${backgroundBlur}px)` }"
      aria-hidden="true"
    />

    <form class="form-card" @submit.prevent>
      <h1>Image Password Strength</h1>
      <p>Change the password to see the effect</p>

      <div class="field">
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          placeholder="Enter Email"
          autocomplete="email"
        >
      </div>

      <div class="field">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter Password"
          autocomplete="current-password"
        >
      </div>

      <button type="submit">
        Submit
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
