# Day26：Double Vertical Slider 初学者详解

> 对应源码：`src/views/Day26_DoubleVerticalSlider/index.vue`<br>
> 对应样式：`src/views/Day26_DoubleVerticalSlider/index.scss`<br>
> 访问路由：`/day26`<br>
> 页面标题：`Double Vertical Slider`

## 1. 这个组件是做什么的？

这是一个**双列、反方向运动的垂直轮播图**。

页面被分成两列：

- 左边占 `35%`，显示彩色背景、标题和副标题；
- 右边占 `65%`，显示大图；
- 中间有向上和向下两个按钮；
- 点击按钮时，两列会同时滑动，但运动方向相反；
- 到达最后一张后会回到第一张，因此可以循环浏览。

可以先把页面想象成下面这样：

```text
┌──────────────────────┬──────────────────────────────────────┐
│                      │                                      │
│   标题                │                                      │
│   副标题              │              大图                    │
│                      │                                      │
│                 [↓] [↑]                                     │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
       左侧 35%                         右侧 65%
```

它最值得学习的不是“放四张图片”，而是下面几个知识点：

1. Vue 的响应式状态 `ref`；
2. Vue 的派生状态 `computed`；
3. 模板引用，也就是通过 `ref` 获得真实 DOM 元素；
4. `v-for` 列表渲染；
5. 动态样式 `:style`；
6. 点击事件 `@click`；
7. CSS 的绝对定位、裁剪和 `transform` 动画；
8. 如何让两组内容以相反方向移动，但始终保持配对。

---

## 2. 它在整个项目中的位置

路由文件 `src/router/index.ts` 中注册了这个页面：

```ts
{
  path: '/day26',
  name: 'day26',
  meta: {
    title: 'Double Vertical Slider',
  },
  component: () => import('~/views/Day26_DoubleVerticalSlider/index.vue'),
}
```

这段路由的意思是：

- 浏览器访问 `/day26` 时，Vue Router 加载当前 `index.vue`；
- `name: 'day26'` 是这条路由在程序里的名字；
- `meta.title` 用来设置浏览器标签页标题；
- `() => import(...)` 是懒加载，只有访问该页面时才加载组件代码。

当前目录中两个源文件的分工如下：

| 文件         | 作用                               |
| ------------ | ---------------------------------- |
| `index.vue`  | 保存数据、切换逻辑和 HTML 模板     |
| `index.scss` | 决定页面布局、颜色、位置和滑动动画 |

---

## 3. 先认识 Vue 单文件组件的三个部分

`index.vue` 是一个 Vue 单文件组件，主要由三块组成：

```vue
<script setup lang="ts" vapor>
  // 数据和逻辑
</script>

<template>
  <!-- 页面结构 -->
</template>

<style scoped lang="scss">
  /* 页面样式 */
</style>
```

### 3.1 `<script setup lang="ts" vapor>`

- `script`：这里写 JavaScript/TypeScript 逻辑；
- `setup`：使用 Vue 3 的 `<script setup>` 写法，声明的数据和函数可以直接给模板使用；
- `lang="ts"`：脚本使用 TypeScript；
- `vapor`：让该组件使用 Vue Vapor 编译模式。对初学者来说，先把它理解为一种编译和渲染方式即可，它不改变本组件“状态变化后界面更新”的基本思路。

普通的 Composition API 组件经常需要从 `setup()` 返回变量，`<script setup>` 不需要：

```ts
const activeSlideIndex = ref(0)
```

在模板中可以直接使用：

```vue
{{ activeSlideIndex }}
```

### 3.2 `<template>`

模板描述最终要显示什么 DOM。模板里既可以写普通 HTML，也可以写 Vue 指令，例如：

- `v-for`：循环生成元素；
- `:style`：动态绑定行内样式；
- `@click`：监听点击事件；
- `ref="sliderContainer"`：保存真实 DOM 元素的引用。

### 3.3 `<style scoped lang="scss">`

- `lang="scss"` 表示可以使用 SCSS 的嵌套语法；
- `scoped` 表示这些样式只作用于当前组件，避免轻易污染其他页面；
- `@use './index.scss'` 把同目录下的样式文件引入当前组件。

---

## 4. 脚本部分：数据是怎样准备的？

## 4.1 `VNodeRef` 是什么？

```ts
import type { VNodeRef } from 'vue'
```

这里使用的是 `import type`，说明 `VNodeRef` 只用于 TypeScript 类型检查，打包后的浏览器代码中不需要它。

本组件用它描述模板 `ref` 可能保存的值：

```ts
const sliderContainer = ref<VNodeRef | null>(null)
```

不过从组件的真实用途看，它最终想拿到的是一个 HTML `div` 元素，因为后面要读取它的 `clientHeight`。更精确、也更容易理解的类型通常会是：

```ts
const sliderContainer = ref<HTMLElement | null>(null)
```

这属于类型表达上的改进建议，不影响理解当前代码的主要运行逻辑。

## 4.2 图片列表 `imgList`

```ts
const imgList = [
  '图片地址 1',
  '图片地址 2',
  '图片地址 3',
  '图片地址 4',
]
```

`imgList` 是一个字符串数组，每个字符串都是一张 Unsplash 图片的网络地址。

模板会把它们变成四个右侧滑块：

```vue
<div
  v-for="img in imgList"
  :key="img"
  :style="{ backgroundImage: `url(${img})` }"
/>
```

注意，这里没有使用 `<img>` 标签，而是把图片地址放到 CSS 的 `background-image` 中。

这样做以后，样式文件可以使用：

```scss
background-size: cover;
background-position: center center;
```

从而让图片铺满区域。图片比例与容器比例不一致时，边缘可能会被裁掉，这是 `cover` 的正常表现。

## 4.3 左侧文案列表 `titleList`

```ts
const titleList = [
  { one: 'Nature flower', two: 'all in pink', color: '#fd3555' },
  { one: 'Bluuue Sky', two: 'with it\'s mountains', color: '#2a86ba' },
  { one: 'Lonely castle', two: 'in the wilderness', color: '#252e33' },
  { one: 'Flying eagle', two: 'in the sunset', color: '#ffb866' },
]
```

数组中的每个对象描述一个左侧面板：

| 属性    | 示例            | 用途             |
| ------- | --------------- | ---------------- |
| `one`   | `Nature flower` | 大标题           |
| `two`   | `all in pink`   | 副标题           |
| `color` | `#fd3555`       | 当前面板的背景色 |

模板用对象解构直接取出三个属性：

```vue
<div
  v-for="({ one, two, color }) in titleList"
  :key="color"
  :style="{ backgroundColor: color }"
>
  <h1>{{ one }}</h1>
  <p>{{ two }}</p>
</div>
```

`{{ one }}` 和 `{{ two }}` 是文本插值；`:style` 前面的冒号是 `v-bind:style` 的缩写。

## 4.4 为什么两个数组的视觉顺序是相反的？

右侧图片正常从上往下排列：

```text
imgList[0]
imgList[1]
imgList[2]
imgList[3]
```

左侧面板在 DOM 中也是从上往下排列：

```text
titleList[0]  Nature flower
titleList[1]  Bluuue Sky
titleList[2]  Lonely castle
titleList[3]  Flying eagle
```

但是左侧整列一开始被向上移动了三屏，因此最先看见的是最后一个文案 `titleList[3]`。于是初始画面的配对是：

```text
左侧：titleList[3]  Flying eagle
右侧：imgList[0]    第一张图片
```

每次切换时：

- 右侧继续向上；
- 左侧向下；
- 所以它们会显示反向索引，但仍然形成正确的一对。

四种可见组合如下：

| `activeSlideIndex` | 右侧可见内容 | 左侧可见内容   |
| -----------------: | ------------ | -------------- |
|                `0` | `imgList[0]` | `titleList[3]` |
|                `1` | `imgList[1]` | `titleList[2]` |
|                `2` | `imgList[2]` | `titleList[1]` |
|                `3` | `imgList[3]` | `titleList[0]` |

这正是“双向垂直轮播”的关键设计。

---

## 5. 响应式状态：组件怎样记住当前页？

## 5.1 当前索引 `activeSlideIndex`

```ts
const activeSlideIndex = ref(0)
```

它表示当前显示到第几组内容：

- `0`：第一组；
- `1`：第二组；
- `2`：第三组；
- `3`：第四组。

`ref(0)` 不只是保存数字，它创建了一个 Vue 响应式引用。脚本中修改它时要写 `.value`：

```ts
activeSlideIndex.value++
```

Vue 发现值变化后，会重新计算依赖它的内容，并更新页面。

在 `<template>` 中通常不用写 `.value`，Vue 会自动解包 Ref。

## 5.2 容器引用 `sliderContainer`

```ts
const sliderContainer = ref<VNodeRef | null>(null)
```

模板中有：

```vue
<div ref="sliderContainer" class="slider-container">
```

它们的连接过程是：

```text
组件脚本刚执行
  ↓
sliderContainer.value 是 null
  ↓
Vue 创建并挂载 <div class="slider-container">
  ↓
Vue 把这个真实 div 保存到 sliderContainer.value
  ↓
点击按钮时，可以读取 div 的 clientHeight
```

这叫作**模板引用**。

## 5.3 实际轮播高度 `sliderHeight`

```ts
const sliderHeight = ref(0)
```

每次点击按钮时，代码会读取容器当前的实际高度：

```ts
sliderHeight.value = sliderContainer.value.clientHeight
```

`clientHeight` 的单位是像素，例如可能得到 `800`。

为什么不始终写死一个高度？因为不同屏幕的视口高度不同，`calc(100vh - 100px)` 最终换算出来的像素数也不同。读取 DOM 可以获得浏览器当前计算后的真实结果。

## 5.4 派生位移 `transform`

```ts
const transform = computed<number>(
  () => activeSlideIndex.value * sliderHeight.value,
)
```

它的公式很简单：

```text
移动距离 = 当前索引 × 一屏高度
```

假设容器高度是 `800px`：

| 当前索引 |        `transform` |
| -------: | -----------------: |
|      `0` |    `0 × 800 = 0px` |
|      `1` |  `1 × 800 = 800px` |
|      `2` | `2 × 800 = 1600px` |
|      `3` | `3 × 800 = 2400px` |

`computed` 适合表达“可以由其他状态计算得到的值”。这里的位移完全由索引和容器高度决定，没有必要再手动维护第三份状态。

---

## 6. 最容易困惑的一行：`initializeTop`

源码：

```ts
const initializeTop = `calc(-${(imgList.length - 1) * 100}vh + 300px)`
```

当前有四张图片：

```text
imgList.length - 1
= 4 - 1
= 3
```

所以字符串最终是：

```css
calc(-300vh + 300px)
```

样式中，一屏轮播区域的高度是：

```scss
height: calc(100vh - 100px);
```

把一屏高度记作 `H`：

```text
H = 100vh - 100px
```

左侧需要先向上移动三屏：

```text
-3H
= -3 × (100vh - 100px)
= -300vh + 300px
```

这就是 `initializeTop` 的来源。它不是一个随便猜出来的数字，而是在把左侧最后一个面板移动到可见区域。

图示如下：

```text
左侧面板原本的位置：

┌ titleList[0] ┐
├ titleList[1] ┤
├ titleList[2] ┤
└ titleList[3] ┘

整体 top = -3H 后，视口看到：

                   ┌───────────────┐
视口 ─────────────▶│ titleList[3]  │
                   └───────────────┘
```

### 这里有一个维护上的隐患

`300px` 是按“四组内容、每屏减去 `100px`”推导出来的固定值。

如果把四张图片改成五张，仅有前半部分会自动变成 `-400vh`，后面的 `300px` 却不会自动变成 `400px`，初始位置就会不准确。

也就是说，当前表达式只在当前数量和当前高度规则下正确。更稳健的思路是：挂载后读取实际容器高度，再使用：

```text
初始位置 = -(总数量 - 1) × 实际容器高度
```

这份文档只解释当前实现，没有直接修改组件行为。

---

## 7. 核心函数 `changeSlide`

完整逻辑：

```ts
function changeSlide(direction: string): void {
  sliderHeight.value = sliderContainer.value.clientHeight

  if (direction === 'up') {
    activeSlideIndex.value++

    if (activeSlideIndex.value > imgList.length - 1)
      activeSlideIndex.value = 0
  }
  else if (direction === 'down') {
    activeSlideIndex.value--

    if (activeSlideIndex.value < 0)
      activeSlideIndex.value = imgList.length - 1
  }
}
```

## 7.1 第一步：测量容器

```ts
sliderHeight.value = sliderContainer.value.clientHeight
```

只有知道一屏有多少像素，程序才能算出应该移动多少像素。

## 7.2 点击向上按钮

```ts
if (direction === 'up') {
  activeSlideIndex.value++
}
```

索引加一，例如：

```text
0 → 1 → 2 → 3
```

如果已经超过最后一项：

```ts
if (activeSlideIndex.value > imgList.length - 1)
  activeSlideIndex.value = 0
```

那么就回到 `0`：

```text
3 → 0
```

## 7.3 点击向下按钮

```ts
else if (direction === 'down') {
  activeSlideIndex.value--
}
```

索引减一：

```text
3 → 2 → 1 → 0
```

如果小于 `0`：

```ts
if (activeSlideIndex.value < 0)
  activeSlideIndex.value = imgList.length - 1
```

就跳到最后一项：

```text
0 → 3
```

这两段边界判断共同实现了**循环轮播**。

## 7.4 为什么只改索引，页面就会动？

调用链如下：

```text
用户点击按钮
  ↓
changeSlide('up') 或 changeSlide('down')
  ↓
activeSlideIndex.value 改变
  ↓
computed 重新计算 transform
  ↓
模板中的动态 transform 样式改变
  ↓
浏览器发现 CSS transform 改变
  ↓
transition 生成 0.5 秒动画
```

Vue 负责把“状态变化”同步为“DOM 样式变化”，CSS 负责让这个变化看起来是平滑动画。

---

## 8. 模板部分：页面结构怎样生成？

## 8.1 最外层容器

```vue
<div class="body base_container">
  <div ref="sliderContainer" class="slider-container">
    ...
  </div>
</div>
```

- `.body`：当前页面自己的样式作用域；
- `.base_container`：项目全局样式中的基础容器类，宽高都是 `100%`；
- `.slider-container`：真正的轮播视口；
- `ref="sliderContainer"`：把这个 DOM 元素交给脚本测量。

项目底部有一个高度为 `100px` 的导航组件，因此轮播区域使用：

```scss
height: calc(100vh - 100px);
```

也就是“浏览器视口高度减去底部导航高度”。

## 8.2 左侧滑块

```vue
<div
  class="left-slide"
  :style="{
    top: initializeTop,
    transform: `translateY(${transform}px)`,
  }"
>
```

这里有两个垂直位置共同生效：

1. `top: initializeTop`：先把整列向上放三屏，让最后一项成为初始可见项；
2. `translateY(+transform)`：索引增加时，左侧整列向下移动。

注意左侧是正数：

```css
translateY(800px)
```

正的 Y 方向代表向下。

## 8.3 右侧滑块

```vue
<div
  class="right-slide"
  :style="{ transform: `translateY(-${transform}px)` }"
>
```

右侧在位移前面加了负号：

```css
translateY(-800px)
```

负的 Y 方向代表向上。

因此同一个 `transform` 数值被两侧复用，但符号相反：

```text
左侧：+transform → 向下
右侧：-transform → 向上
```

这就是两列反向运动的核心。

## 8.4 两个按钮

```vue
<button class="btn down-button" @click="changeSlide('down')">
  <i class="fas fa-arrow-down" />
</button>

<button class="btn up-button" @click="changeSlide('up')">
  <i class="fas fa-arrow-up" />
</button>
```

`@click` 是 `v-on:click` 的简写：

- 点击下箭头，调用 `changeSlide('down')`；
- 点击上箭头，调用 `changeSlide('up')`。

`fas fa-arrow-down` 和 `fas fa-arrow-up` 是 Font Awesome 图标类。项目入口 `src/main.ts` 已经全局导入：

```ts
import '@fortawesome/fontawesome-free/css/all.min.css'
```

所以当前组件不用再次导入图标样式。

---

## 9. 样式部分：为什么只能看见一屏？

## 9.1 轮播视口

```scss
.slider-container {
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: calc(100vh - 100px);
}
```

关键是：

```scss
overflow: hidden;
```

左右两列内部其实各有四屏内容，总高度远大于容器。但是超出容器的部分会被裁掉，所以用户每次只能看见一屏。

可以把容器想象成一扇窗：内容在窗户后面上下移动，窗户外面的内容暂时看不见。

## 9.2 左右两列的宽度

左侧：

```scss
.left-slide {
  width: 35%;
  left: 0;
}
```

右侧：

```scss
.right-slide {
  left: 35%;
  width: 65%;
}
```

所以正好铺满一整行：

```text
35% + 65% = 100%
```

## 9.3 为什么每个子项都是一整屏？

```scss
.left-slide div,
.right-slide div {
  height: 100%;
  width: 100%;
}
```

每个子项的高度都是父列高度的 `100%`，也就是一整个轮播视口。

四个子项自然从上往下排列，形成四屏长列：

```text
┌──────── 一屏 ────────┐
├──────── 一屏 ────────┤
├──────── 一屏 ────────┤
└──────── 一屏 ────────┘
```

## 9.4 动画来自哪里？

左右两列都有：

```scss
transition: transform 0.5s ease-in-out;
```

它的意思是：

- 只监听 `transform` 的变化；
- 动画持续 `0.5s`；
- `ease-in-out` 表示开始和结束比较慢，中间比较快。

如果没有这行，点击后内容仍然会切换，但会瞬间跳到新位置，而不是平滑滑动。

## 9.5 左侧文字为什么居中？

```scss
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
```

- `display: flex`：启用弹性布局；
- `flex-direction: column`：标题和副标题纵向排列；
- `align-items: center`：水平方向居中；
- `justify-content: center`：垂直方向居中。

## 9.6 按钮为什么在两列交界处？

```scss
.btn {
  position: absolute;
  left: 35%;
  top: 50%;
}
```

- `left: 35%` 正好是左右两列的分界线；
- `top: 50%` 放在容器垂直中点；
- `position: absolute` 让它相对 `.slider-container` 精确定位；
- `z-index: 100` 让按钮显示在图片和色块上方。

下按钮：

```scss
transform: translateX(-100%);
```

把自己向左移动一个自身宽度，因此落在分界线左边。

上按钮：

```scss
transform: translateY(-100%);
```

把自己向上移动一个自身高度，因此两个按钮会在中心分界处拼在一起。

---

## 10. 用一个具体数字完整走一遍

假设浏览器视口高度为 `900px`，底部导航高度为 `100px`。

那么轮播容器高度是：

```text
sliderHeight = 900 - 100 = 800px
```

### 初始状态

```text
activeSlideIndex = 0
transform = 0 × 800 = 0px
```

右侧：

```css
transform: translateY(-0px);
```

显示 `imgList[0]`。

左侧初始 `top`：

```text
-3 × 800px = -2400px
```

所以显示 `titleList[3]`。

### 第一次点击向上按钮

```text
activeSlideIndex: 0 → 1
transform: 1 × 800 = 800px
```

右侧：

```css
translateY(-800px)
```

向上移动一屏，显示 `imgList[1]`。

左侧最终位置：

```text
初始 top + transform
= -2400px + 800px
= -1600px
```

它向下移动一屏，显示 `titleList[2]`。

### 再点击两次向上按钮

```text
索引 1 → 2 → 3
```

依次显示：

```text
imgList[2] + titleList[1]
imgList[3] + titleList[0]
```

### 在索引 3 再点击一次向上按钮

索引临时变成 `4`，超过最大索引 `3`，因此重置成 `0`：

```text
3 → 4 → 0
```

轮播回到第一组。

---

## 11. 当前写法中值得初学者注意的地方

下面这些不是“完全不能运行”，而是阅读和维护时应该意识到的边界。

### 11.1 图片数量和文案数量默认必须相等

当前逻辑用 `imgList.length` 控制索引，但没有检查 `titleList.length`。

如果两个数组长度不同，就可能出现图片有内容、左侧却没有对应文案的情况。

更稳健的数据结构可以把图片和文案放在同一个对象中，例如：

```ts
interface Slide {
  image: string
  title: string
  subtitle: string
  color: string
}
```

不过当前项目为了演示“双列相反顺序”的思路，使用了两个数组。

### 11.2 `direction` 的类型过宽

当前写法：

```ts
function changeSlide(direction: string): void
```

这允许调用者传入任何字符串，例如 `'left'`，但函数不会处理它。

更精确的 TypeScript 类型可以是：

```ts
function changeSlide(direction: 'up' | 'down'): void
```

这样写错参数时，编辑器会提前提示。

### 11.3 DOM 引用缺少空值保护

组件挂载前，`sliderContainer.value` 是 `null`。当前按钮只有挂载后才能点击，所以正常交互中通常已经存在 DOM；但从类型安全和健壮性上说，最好仍然检查：

```ts
const container = sliderContainer.value
if (!container)
  return
```

然后再读取：

```ts
container.clientHeight
```

### 11.4 初始位置公式写死了 `300px`

前面已经推导过，`300px` 依赖当前“四组内容”和“减去 100px 导航”的设计。改变数量或高度规则后要同步修改，否则左右内容会错位。

### 11.5 网络资源可能加载失败

图片和 Open Sans 字体来自外部网站：

- Unsplash 图片 URL；
- Google Fonts URL。

断网、跨域网络受限或资源地址失效时，页面可能没有图片或退回系统字体。若项目需要稳定部署，可以考虑把资源放到本地。

### 11.6 可访问性还可以加强

当前按钮只显示图标，没有文本或 `aria-label`；同时样式把聚焦轮廓去掉了：

```scss
.btn:focus {
  outline: none;
}
```

这会让使用键盘或屏幕阅读器的用户更难理解和操作按钮。更好的做法包括：

```vue
<button type="button" aria-label="查看上一组">
```

以及为 `:focus-visible` 提供清晰的聚焦样式，而不是直接移除轮廓。

### 11.7 按钮最好显式声明 `type="button"`

HTML `<button>` 默认类型是 `submit`。当前组件不在表单里，所以没有实际问题；但为了避免未来嵌入表单后意外提交，通常会写：

```vue
<button type="button">
```

### 11.8 “循环”并不等于“无缝循环”

索引从最后一项直接重置到第一项时，位移值会从三屏跳回零屏。CSS 会对这个距离做过渡，但它不是通过复制首尾项实现的真正无缝轮播。

如果产品要求完全无缝，通常需要克隆首尾内容，并在动画结束后瞬间校正位置。

---

## 12. Vue 初学者常见问题

### 问题 1：为什么 `ref` 在脚本里有 `.value`，模板里没有？

脚本面对的是 Ref 对象本身，所以要通过 `.value` 访问内部值：

```ts
activeSlideIndex.value
```

Vue 模板会自动解包 Ref，所以模板中直接使用：

```vue
{{ activeSlideIndex }}
```

### 问题 2：为什么 `ref` 和 `computed` 没有从 Vue 导入？

项目在 `vite.config.ts` 中配置了自动导入：

```ts
AutoImport({
  imports: ['vue', 'vue-router'],
  dts: 'types/auto-imports.d.ts',
})
```

因此构建工具会自动补充 `ref`、`computed` 等 Vue API 的导入。单独复制这段组件到一个没有自动导入配置的项目时，需要自己写：

```ts
import { computed, ref } from 'vue'
```

### 问题 3：`v-for` 为什么需要 `:key`？

`key` 是每个列表项的稳定身份标识，帮助 Vue 判断哪个 DOM 对应哪个数据。

当前代码分别用：

```vue
:key="color"
:key="img"
```

只要颜色和图片 URL 在各自数组中不重复，就可以作为当前列表的 key。

### 问题 4：为什么不用改变每一张图的 `display`？

这个组件没有逐张隐藏和显示，而是：

1. 把所有内容竖着排成一列；
2. 用外层容器裁掉不可见部分；
3. 移动整列的位置。

这种方式非常适合制作滑动动画。

### 问题 5：为什么动画写在 CSS，不写在 JavaScript？

JavaScript/Vue 更适合决定“移动到哪里”，CSS 更适合决定“怎样移动过去”。

本组件的分工很清晰：

```text
Vue：计算新的 transform 数值
CSS：让 transform 在 0.5 秒内平滑变化
```

### 问题 6：`100vh` 是什么？

`vh` 是视口高度单位：

```text
100vh = 浏览器可视区域高度的 100%
50vh  = 浏览器可视区域高度的一半
```

本项目还要给 `100px` 高的导航留空间，所以使用：

```css
calc(100vh - 100px)
```

---

## 13. 一句话记住整个组件

> 这个组件把四个左侧文案和四张右侧图片分别竖着排成两列，用一个响应式索引计算整屏位移；左列使用正位移向下，右列使用负位移向上，再由 `overflow: hidden` 裁掉视口外内容、由 CSS `transition` 产生动画。

可以再压缩成下面这条公式：

```text
状态 activeSlideIndex
  → 位移 activeSlideIndex × 容器高度
  → 左边 +位移、右边 -位移
  → 双列反向滑动
```

---

## 14. 建议的阅读顺序

如果你是初学者，建议按下面顺序重新看源码：

1. 先看 `imgList` 和 `titleList`，确认页面有哪些内容；
2. 看模板里的两个 `v-for`，理解数组怎样生成 DOM；
3. 看 `.slider-container` 的 `overflow: hidden`；
4. 看左右子项为什么都是 `height: 100%`；
5. 看 `activeSlideIndex` 和 `changeSlide`；
6. 用纸笔算一次 `索引 × 800px`；
7. 对比左侧 `translateY(+值)` 和右侧 `translateY(-值)`；
8. 最后再理解 `initializeTop` 为什么是 `-3H`。

完成这八步后，你就已经掌握了这个组件最核心的逻辑。
