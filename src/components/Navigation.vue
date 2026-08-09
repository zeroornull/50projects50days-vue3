<!-- Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 -->
<script setup lang="ts">
import { routes } from '~/router'

const router = useRouter()
const route = useRoute()
const projectRoutes = routes.filter(item => 'meta' in item)

const currentRouteIdx = computed(() => {
  const topLevelPath = route.matched[0]?.path
  return projectRoutes.findIndex(item => item.path === topLevelPath)
})

const previousRoute = computed(() => projectRoutes[currentRouteIdx.value - 1])
const nextRoute = computed(() => projectRoutes[currentRouteIdx.value + 1])
const totalProjects = projectRoutes.length

const currentProjectNumber = computed(() => {
  if (currentRouteIdx.value < 0) return 1

  return currentRouteIdx.value + 1
})

const progress = computed(() => (totalProjects > 0 ? currentProjectNumber.value / totalProjects : 0))

const previousTitle = computed(() => {
  const title = previousRoute.value?.meta?.title
  return typeof title === 'string' ? title : '已经是第一个项目'
})

const nextTitle = computed(() => {
  const title = nextRoute.value?.meta?.title
  return typeof title === 'string' ? title : '已经是最后一个项目'
})

function goPrev() {
  const prev = previousRoute.value
  if (prev) router.push(prev.path)
}

function goNext() {
  const next = nextRoute.value
  if (next) router.push(next.path)
}
</script>

<template>
  <nav class="navigation" aria-label="项目切换">
    <button
      class="navigation__action navigation__action--previous"
      type="button"
      :disabled="!previousRoute"
      :aria-label="`上一页：${previousTitle}`"
      @click="goPrev"
    >
      <span class="navigation__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18 9 12l6-6" />
        </svg>
      </span>
      <span class="navigation__copy">
        <span class="navigation__direction">上一页</span>
        <span class="navigation__title">{{ previousTitle }}</span>
      </span>
    </button>

    <div class="navigation__status" aria-live="polite">
      <span class="navigation__status-label">项目进度</span>
      <span class="navigation__count">
        <strong>{{ String(currentProjectNumber).padStart(2, '0') }}</strong>
        <span>/ {{ String(totalProjects).padStart(2, '0') }}</span>
      </span>
      <span class="navigation__track" aria-hidden="true">
        <span class="navigation__progress" :style="{ transform: `scaleX(${progress})` }" />
      </span>
    </div>

    <button
      class="navigation__action navigation__action--next"
      type="button"
      :disabled="!nextRoute"
      :aria-label="`下一页：${nextTitle}`"
      @click="goNext"
    >
      <span class="navigation__copy">
        <span class="navigation__direction">下一页</span>
        <span class="navigation__title">{{ nextTitle }}</span>
      </span>
      <span class="navigation__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
/* Hallmark · component: navigation · genre: modern-minimal · theme: project-neutral-dark
 * states: default · hover · focus · active · disabled
 * contrast: pass
 */
.navigation {
  --nav-background: oklch(15% 0.012 265deg);
  --nav-surface: oklch(20% 0.014 265deg);
  --nav-surface-hover: oklch(25% 0.018 265deg);
  --nav-border: oklch(100% 0 0deg / 10%);
  --nav-border-strong: oklch(100% 0 0deg / 18%);
  --nav-ink: oklch(97% 0.004 265deg);
  --nav-muted: oklch(72% 0.016 265deg);
  --nav-accent: oklch(78% 0.145 192deg);
  --nav-focus: oklch(84% 0.14 192deg);
  --nav-shadow: oklch(0% 0 0deg / 28%);
  --nav-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --nav-duration: 180ms;
  --nav-radius: 14px;

  position: relative;
  z-index: 999;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(72px, 116px) minmax(0, 1fr);
  align-items: stretch;
  width: 100%;
  height: 100px;
  padding: 12px clamp(12px, 2.5vw, 32px);
  gap: clamp(8px, 1.5vw, 16px);
  overflow: clip;
  color: var(--nav-ink);
  background: var(--nav-background);
  border-top: 1px solid var(--nav-border);
  box-shadow: 0 -12px 32px var(--nav-shadow);
  isolation: isolate;
}

.navigation__action {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  padding: 0 clamp(10px, 2vw, 20px);
  gap: clamp(8px, 1.2vw, 14px);
  overflow: hidden;
  color: var(--nav-ink);
  font: inherit;
  text-align: left;
  background: var(--nav-surface);
  border: 1px solid var(--nav-border);
  border-radius: var(--nav-radius);
  cursor: pointer;
  transform: translateY(0);
  transition: transform var(--nav-duration) var(--nav-ease-out);

  &::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: '';
    background: var(--nav-surface-hover);
    opacity: 0;
    transition: opacity var(--nav-duration) var(--nav-ease-out);
  }

  &:hover:not(:disabled)::before {
    opacity: 1;
  }

  &:focus-visible {
    outline: 3px solid var(--nav-focus);
    outline-offset: -3px;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }
}

.navigation__action--next {
  justify-content: flex-end;
  text-align: right;
}

.navigation__icon {
  display: grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  place-items: center;
  color: var(--nav-accent);
  border: 1px solid var(--nav-border-strong);
  border-radius: 50%;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentcolor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.navigation__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}

.navigation__direction {
  color: var(--nav-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.navigation__title {
  margin-top: 5px;
  overflow: hidden;
  color: var(--nav-ink);
  font-size: clamp(13px, 1.3vw, 15px);
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation__status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.navigation__status-label {
  color: var(--nav-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.navigation__count {
  display: flex;
  align-items: baseline;
  margin-top: 2px;
  color: var(--nav-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;

  strong {
    color: var(--nav-ink);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }
}

.navigation__track {
  width: min(64px, 72%);
  height: 2px;
  margin-top: 9px;
  overflow: hidden;
  background: var(--nav-border-strong);
  border-radius: 999px;
}

.navigation__progress {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--nav-accent);
  border-radius: inherit;
  transform-origin: left center;
  transition: transform 320ms var(--nav-ease-out);
}

@media (max-width: 540px) {
  .navigation {
    padding-inline: 8px;
    gap: 8px;
  }

  .navigation__action {
    padding-inline: 8px;
    gap: 8px;
  }

  .navigation__icon {
    width: 32px;
    height: 32px;
  }

  .navigation__title {
    display: none;
  }

  .navigation__direction {
    color: var(--nav-ink);
    font-size: 12px;
    letter-spacing: 0;
    white-space: nowrap;
  }
}

@media (max-width: 360px) {
  .navigation {
    grid-template-columns: minmax(0, 1fr) 64px minmax(0, 1fr);
    gap: 6px;
  }

  .navigation__action {
    justify-content: center;
    padding-inline: 6px;
  }

  .navigation__status-label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .navigation__action,
  .navigation__action::before,
  .navigation__progress {
    transition-duration: 100ms;
  }

  .navigation__action:active:not(:disabled) {
    transform: none;
  }
}
</style>
