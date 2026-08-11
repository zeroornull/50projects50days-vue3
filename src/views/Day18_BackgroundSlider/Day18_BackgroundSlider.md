# Day18：Background Slider 页面说明与面试复习

## 1. 页面概览

- **路由地址**：`/day18`
- **路由名称**：`day18`
- **页面标题**：`Background Slider`
- **页面组件**：`src/views/Day18_BackgroundSlider/index.vue`
- **样式文件**：`src/views/Day18_BackgroundSlider/index.scss`

这个页面实现了一个**背景联动的图片轮播器**：

1. 页面外层显示当前图片作为全屏背景；
2. 中间的轮播容器显示同一张图片的清晰区域；
3. 外层背景覆盖半透明黑色遮罩，用来突出中间内容；
4. 点击左右箭头可以切换图片；
5. 到达图片列表首尾后，会循环切换到另一端。

该页面主要用于练习以下知识点：

- Vue 3 Composition API 中的 `ref`、`reactive`；
- 响应式状态如何驱动动态样式和动态类名；
- `v-for` 列表渲染及 `key` 的作用；
- 轮播图的循环索引处理；
- CSS 定位、裁剪、遮罩、层叠上下文和过渡动画；
- Vite 项目中的静态资源引用方式；
- TypeScript 中数组越界与类型断言问题。

---

## 2. 文件职责

### 2.1 `index.vue`

`index.vue` 负责：

- 声明图片列表和当前图片索引；
- 处理上一张、下一张的点击事件；
- 同步外层背景、轮播项激活状态；
- 根据状态渲染所有图片；
- 给当前图片添加 `active` 类；
- 通过内联样式设置背景图地址。

### 2.2 `index.scss`

`index.scss` 负责：

- 页面整体居中布局；
- 外层背景图的铺满显示；
- 使用伪元素创建暗色遮罩；
- 创建轮播窗口并裁剪溢出内容；
- 通过 `opacity` 实现图片淡入淡出；
- 定位左右切换按钮并添加悬停效果。

---

## 3. 核心状态

页面维护了三个响应式状态。

### 3.1 图片列表 `imgList`

```ts
const imgList = reactive<{ active: boolean, url: string }[]>([
  { active: true, url: 'src/assets/imgs/001.jpg' },
  { active: false, url: 'src/assets/imgs/002.jpg' },
  { active: false, url: 'src/assets/imgs/003.png' },
  { active: false, url: 'src/assets/imgs/004.jpg' },
])
```

每个图片对象包含：

| 字段     | 类型      | 作用                                  |
| -------- | --------- | ------------------------------------- |
| `url`    | `string`  | 图片地址，用于设置 `background-image` |
| `active` | `boolean` | 控制该轮播项是否显示                  |

数组由 `reactive` 包装，因此修改数组元素的 `active` 属性时，Vue 可以追踪变化并更新模板。

### 3.2 当前索引 `activeSlide`

```ts
const activeSlide = ref(0)
```

`activeSlide` 是当前图片在 `imgList` 中的下标。初始值为 `0`，表示默认展示第一张图片。

它是一个数字基本类型，因此使用 `ref` 保存。在脚本中读取或修改时需要使用 `.value`：

```ts
activeSlide.value++
```

### 3.3 外层背景地址 `bgImgUrl`

```ts
const bgImgUrl = ref('')
```

`bgImgUrl` 保存当前激活图片的地址，并绑定到最外层容器：

```vue
<div
  class="body base_container"
  :style="{ backgroundImage: `url(${bgImgUrl})` }"
>
```

模板会自动解包顶层 `Ref`，因此这里不需要写 `bgImgUrl.value`。

---

## 4. 初始化与运行流程

### 4.1 初始化

组件在脚本顶层调用：

```ts
publicFn()
```

`publicFn` 会根据 `activeSlide` 完成第一次状态同步：

1. 将第一张图片地址写入 `bgImgUrl`；
2. 把所有图片的 `active` 设为 `false`；
3. 再把当前图片的 `active` 设为 `true`。

虽然调用语句写在函数定义前面，但 `publicFn` 使用的是函数声明：

```ts
function publicFn() {
  // ...
}
```

函数声明会被提升，因此可以在源码中的声明位置之前调用。

### 4.2 点击左箭头

```ts
function leftClick() {
  activeSlide.value--

  if (activeSlide.value < 0)
    activeSlide.value = imgList.length - 1

  publicFn()
}
```

执行流程：

```text
点击左箭头
  ↓
当前索引减 1
  ↓
索引是否小于 0？
  ├─ 是：切换为最后一张图片的索引
  └─ 否：保持当前索引
  ↓
同步背景地址与 active 状态
  ↓
Vue 更新页面
```

### 4.3 点击右箭头

```ts
function rightClick() {
  activeSlide.value++

  if (activeSlide.value > imgList.length - 1)
    activeSlide.value = 0

  publicFn()
}
```

右侧切换与左侧相反：索引超过最后一项时，重新回到第一张图片。

### 4.4 公共同步函数

```ts
function publicFn() {
  bgImgUrl.value = (imgList[activeSlide.value] as any).url || ''
  imgList.forEach(slide => (slide.active = false))
  ;(imgList[activeSlide.value] as any).active = true
}
```

该函数把当前索引同步到两个地方：

- `bgImgUrl`：决定页面外层背景；
- `imgList[i].active`：决定中间哪一张轮播图可见。

因此，当前实现的数据流可以概括为：

```text
按钮点击
  ↓
修改 activeSlide
  ↓
调用 publicFn
  ↓
更新 bgImgUrl + 每一项的 active
  ↓
动态 style + 动态 class 更新
  ↓
外层背景和中间图片同步切换
```

---

## 5. 模板实现

### 5.1 列表渲染

```vue
<div
  v-for="({ active, url }) in imgList"
  :key="url"
  class="slide base-main-h"
  :class="[active ? 'active' : '']"
  :style="{ backgroundImage: `url(${url})` }"
/>
```

这里涉及三个 Vue 模板能力：

#### `v-for`

遍历 `imgList`，为每张图片创建一个 `.slide` 元素。

#### `:key="url"`

`key` 帮助 Vue 在更新列表时识别每个节点的身份。图片地址在当前列表中是唯一且稳定的，因此可以作为 `key`。

如果未来允许相同图片重复出现，或者图片地址可能变化，则应该使用稳定的唯一 `id`，而不是 `url` 或数组下标。

#### 动态类名

```vue
:class="[active ? 'active' : '']"
```

只有当前项的 `active` 为 `true` 时，才会得到 `.active` 类。也可以简写为更直观的对象语法：

```vue
:class="{ active }"
```

#### 动态背景图

```vue
:style="{ backgroundImage: `url(${url})` }"
```

对象语法会把 JavaScript 状态映射成元素的内联样式。这里使用 `background-image` 而不是 `<img>`，便于配合 `background-size: cover` 完成裁剪和铺满。

### 5.2 点击事件

```vue
<button type="button" class="arrow left-arrow" aria-label="上一张图片" @click="leftClick">
  <i class="fa-solid fa-arrow-left" aria-hidden="true" />
</button>

<button type="button" class="arrow right-arrow" aria-label="下一张图片" @click="rightClick">
  <i class="fa-solid fa-arrow-right" aria-hidden="true" />
</button>
```

`@click` 是 `v-on:click` 的简写。由于处理函数不需要显式接收事件对象，所以模板直接传递函数名即可。

按钮使用 Font Awesome 提供的实心箭头图标。项目已经安装 `@fortawesome/fontawesome-free`，并在应用入口 `src/main.ts` 中全局加载样式：

```ts
import '@fortawesome/fontawesome-free/css/all.min.css'
```

其中，`fa-solid` 选择免费实心图标样式，`fa-arrow-left` 和 `fa-arrow-right` 指定具体图标。`aria-label` 为按钮提供可被辅助技术读取的名称，图标本身通过 `aria-hidden="true"` 避免被重复朗读。

Font Awesome 的 CSS 必须在图标渲染前被应用。如果只写 `<i class="fa-solid fa-arrow-left">` 而没有加载 Font Awesome 样式，`<i>` 是一个没有文本内容的空元素，页面上不会出现箭头。

---

## 6. 样式原理

### 6.1 外层背景

```scss
.body {
  background-position: center center;
  background-size: cover;
  transition: 0.4s;
  position: relative;
}
```

- `background-position: center`：始终以图片中心为对齐点；
- `background-size: cover`：保持图片比例，并让图片覆盖整个区域；
- `position: relative`：为内部绝对定位内容和伪元素提供定位参考。

需要注意，CSS 通常不能在两张不同的 `background-image` 之间做真正的插值动画。当前页面可见的淡入淡出效果主要来自 `.slide` 的 `opacity` 过渡，而不是外层背景图片本身。

### 6.2 暗色遮罩

```scss
.body::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 0;
}
```

源码分别设置了 `top`、`left`、`width`、`height`，作用等价于上面的 `inset: 0`：创建一个覆盖整个外层背景的半透明黑色伪元素。

遮罩的作用是降低外层背景亮度，使中间轮播窗口更加突出。

### 6.3 轮播窗口与裁剪

```scss
.slider-container {
  height: 70vh;
  width: 70vw;
  position: relative;
  overflow: hidden;
}
```

轮播容器只占视口的约 70%，并通过 `overflow: hidden` 隐藏图片超出容器的部分。因此它更像一个“观察窗口”。

内部图片使用更大的尺寸和负偏移：

```scss
.slide {
  width: 100vw;
  position: absolute;
  top: -15vh;
  left: -15vw;
}
```

水平方向上，`100vw - 70vw = 30vw`，左右各偏移 `15vw`，从而把大图的中央区域放入轮播窗口。垂直方向还会受到共享类 `.base-main-h`（`height: calc(100vh - 100px)`）影响，因此实际裁剪结果也与页面公共布局高度有关。

### 6.4 淡入淡出

```scss
.slide {
  opacity: 0;
  transition: 0.4s ease;
}

.slide.active {
  opacity: 1;
}
```

所有图片都叠放在同一位置，默认透明。当前项增加 `.active` 类后，透明度从 `0` 过渡到 `1`，形成淡入效果。

由于非激活项仍然存在于 DOM 中，只是透明度为 `0`，如果轮播项中以后加入链接、按钮等可交互内容，还需要处理 `pointer-events`、焦点顺序和无障碍隐藏问题。

### 6.5 箭头定位

当前箭头使用：

```scss
.arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
}
```

`position: fixed` 会相对于视口定位，而不是相对于 `.slider-container` 定位。当前页面根据 `15vw` 计算左右位置，使按钮看起来贴近轮播容器两侧。

如果希望组件放到任何父容器中都能保持正确布局，通常更适合使用 `position: absolute`，再让按钮相对于 `.slider-container` 定位。

---

## 7. Vue 3 与 TypeScript 知识点

### 7.1 `<script setup>`

组件使用：

```vue
<script setup lang="ts" vapor>
```

- `setup`：启用 Vue 3 的 `<script setup>` 编译语法；
- `lang="ts"`：脚本使用 TypeScript；
- `vapor`：该仓库启用了 Vue Vapor 编译模式。

`<script setup>` 中的顶层变量和函数会自动暴露给模板，不需要手动编写 `setup()` 并 `return`。

### 7.2 为什么没有导入 `ref` 和 `reactive`

源码没有显式写：

```ts
import { reactive, ref } from 'vue'
```

这是因为项目在 `vite.config.ts` 中配置了 `unplugin-auto-import`：

```ts
AutoImport({
  imports: ['vue', 'vue-router'],
  dts: 'types/auto-imports.d.ts',
})
```

自动导入是构建工具提供的能力，不是 Vue 或 JavaScript 默认支持的语法。离开这个项目配置后，仍然需要显式导入相关 API。

### 7.3 `reactive` 数组能否追踪元素属性变化

可以。`reactive` 会递归地把普通对象转换为响应式代理，因此以下修改可以触发依赖更新：

```ts
imgList[0].active = true
```

但以下情况需要注意：

- 如果把某个属性值解构成普通局部变量，可能失去与原响应式对象的连接；
- 如果把代理对象交给只接受普通对象的第三方库，可能需要使用 `toRaw`，但不应随意使用；
- 对响应式数组进行整体替换时，使用 `ref` 保存数组通常会更直接。

### 7.4 为什么使用了 `as any`

源码中有：

```ts
(imgList[activeSlide.value] as any).url
```

从类型安全角度看，数组下标访问存在越界可能，当前元素理论上可能是 `undefined`。`as any` 直接关闭了这部分类型检查，但也会掩盖真实错误。

更安全的处理方式是先取值并检查：

```ts
const currentSlide = imgList[activeSlide.value]

if (!currentSlide)
  return

bgImgUrl.value = currentSlide.url
```

这样既能满足 TypeScript，也能在列表为空或索引异常时安全退出。

---

## 8. 当前实现的可改进点

以下内容不是页面当前功能的必要条件，但经常会成为代码评审或面试追问。

### 8.1 避免维护重复状态

当前代码同时维护：

- `activeSlide`；
- `bgImgUrl`；
- 每一项的 `active`。

实际上，后两者都可以由 `activeSlide` 推导出来。多份状态需要通过 `publicFn` 手动保持同步，容易出现其中一份忘记更新的问题。

可以把当前图片改为计算属性：

```ts
const currentSlide = computed(() => imgList[activeSlide.value])
const bgImgUrl = computed(() => currentSlide.value?.url ?? '')
```

模板中也可以直接根据索引判断：

```vue
<div
  v-for="({ url }, index) in imgList"
  :key="url"
  :class="{ active: index === activeSlide }"
/>
```

这样只保留 `activeSlide` 这一份“事实来源”，状态会更容易维护。

### 8.2 用取模统一循环索引

向右切换可以写成：

```ts
activeSlide.value = (activeSlide.value + 1) % imgList.length
```

向左切换时，为避免 JavaScript 负数取余得到负数，可以写成：

```ts
activeSlide.value
  = (activeSlide.value - 1 + imgList.length) % imgList.length
```

使用这种写法前仍应保证 `imgList.length > 0`，否则会得到 `NaN`。

### 8.3 使用可被 Vite 正确处理的图片资源

当前图片地址是运行时字符串：

```ts
'src/assets/imgs/001.jpg'
```

这种写法在开发环境中可能可用，但 Vite 无法像静态 `import` 那样可靠地分析、复制并生成生产环境的哈希资源地址，在非根路径部署时也可能产生错误 URL。

更稳妥的写法是静态导入：

```ts
import image001 from '@/assets/imgs/001.jpg'
```

或者在适用场景中使用：

```ts
const image001 = new URL('../../assets/imgs/001.jpg', import.meta.url).href
```

如果资源放在 `public` 目录，则可以使用以 `/` 开头的公共路径，但这类资源不会经过 Vite 的哈希和模块依赖处理。

### 8.4 图片预加载

第一次切换到尚未缓存的图片时，浏览器可能需要临时下载资源，造成短暂空白或闪烁。可以在组件初始化时预加载：

```ts
imgList.forEach(({ url }) => {
  const image = new Image()
  image.src = url
})
```

实际项目中还要权衡图片数量、文件大小、首屏性能和网络流量，不应无条件预加载大量高清图片。

### 8.5 可访问性

当前按钮已经提供了明确的按钮类型和无障碍名称：

```vue
<button type="button" aria-label="上一张图片">
```

其中，可见箭头对辅助技术设置了 `aria-hidden="true"`，避免它和 `aria-label` 被重复朗读。还可以继续支持：

- 左右方向键切换；
- 清晰可见的 `:focus-visible` 样式；
- 当前图片序号，例如“第 2 张，共 4 张”；
- 为偏好减少动画的用户适配 `prefers-reduced-motion`；
- 如果图片包含内容信息，使用 `<img>` 和合适的 `alt`，而不是仅作为 CSS 背景。

### 8.6 函数命名

`publicFn` 无法直接表达函数职责。更清晰的名称可以是：

```ts
syncActiveSlide()
```

或在移除重复状态后，直接不再需要这个同步函数。

---

## 9. 高频面试题与参考答案

### 9.1 `ref` 和 `reactive` 有什么区别？

**参考答案：**

- `ref` 可以保存基本类型，也可以保存对象；脚本中通过 `.value` 读写；
- `reactive` 主要用于对象、数组、`Map`、`Set` 等对象类型，返回响应式代理；
- 模板会自动解包顶层 `Ref`；
- `reactive` 对象直接解构可能失去响应性连接，可使用 `toRefs`、`toRef`，或者保持通过原对象访问；
- 状态选择不只看类型，还要考虑能否整体替换、状态组织方式和团队约定。

本页面用 `ref` 保存索引和字符串，用 `reactive` 保存对象数组。

### 9.2 为什么脚本中 `activeSlide` 要写 `.value`，模板中却不用？

**参考答案：**

`ref()` 返回的是一个带 `value` 属性的 Ref 对象，JavaScript 中需要显式访问 `.value`。Vue 模板编译器会自动解包顶层 Ref，所以模板中可以直接使用 `activeSlide` 和 `bgImgUrl`。

### 9.3 修改 `reactive` 数组中对象的属性，视图会更新吗？

**参考答案：**

会。Vue 3 基于 `Proxy` 追踪对象的读取和写入，数组元素中的嵌套普通对象也会被深层转换为响应式代理。执行 `slide.active = true` 时，依赖该属性的模板会重新更新。

### 9.4 为什么 `v-for` 需要 `key`？能否使用数组下标？

**参考答案：**

`key` 用来标识虚拟 DOM 节点的身份，帮助 Vue 在列表变化时正确复用、移动或销毁节点。静态且永不重排的简单列表使用下标通常不会立即出错，但在插入、删除、排序以及子项带局部状态时，使用下标容易导致状态与 DOM 错配。优先使用稳定、唯一、与列表项绑定的业务 ID。

### 9.5 如何实现轮播图的无限循环？

**参考答案：**

最基础的方式是处理索引边界：超过末尾回到 `0`，小于 `0` 回到 `length - 1`。也可以使用取模：

```ts
const next = (current + 1) % length
const prev = (current - 1 + length) % length
```

必须额外处理空数组，因为对 `0` 取模会得到 `NaN`。

### 9.6 当前页面为什么需要 `publicFn`？有什么设计问题？

**参考答案：**

它用于把 `activeSlide` 同步到 `bgImgUrl` 和各图片的 `active` 属性。问题是同一个事实被保存成了多份可变状态，存在不同步风险。更好的方式通常是把当前索引作为唯一事实来源，其他值通过 `computed` 或模板表达式推导。

### 9.7 `computed` 和普通函数有什么区别？

**参考答案：**

`computed` 会追踪响应式依赖，并缓存计算结果；依赖没有变化时，多次读取不会重新计算。普通函数每次调用都会执行。像“根据当前索引得到当前图片”这种派生状态适合使用 `computed`。

### 9.8 动态 `class` 和动态 `style` 常见写法有哪些？

**参考答案：**

动态类名支持字符串、数组和对象：

```vue
:class="active ? 'active' : ''"
:class="['slide', { active }]"
```

动态样式支持对象和数组：

```vue
:style="{ backgroundImage: `url(${url})` }"
```

对象语法通常更适合条件明确、属性较多的场景。

### 9.9 `background-size: cover` 的计算逻辑是什么？

**参考答案：**

`cover` 会保持图片宽高比，并按能够完全覆盖容器的最小比例缩放图片。结果是容器不会出现空白，但图片某些边缘可能被裁剪。`contain` 则保证图片完整显示，但容器可能出现空白区域。

### 9.10 `opacity: 0`、`visibility: hidden` 和 `display: none` 有什么区别？

**参考答案：**

- `opacity: 0`：元素仍参与布局和绘制层叠，也可能接收鼠标和键盘交互；可以做透明度过渡；
- `visibility: hidden`：保留布局空间，通常不接收交互，可以做有限的过渡组合；
- `display: none`：不参与布局，也不会显示，不能直接从 `display: none` 做平滑过渡。

本页面选择 `opacity`，是为了实现图片淡入淡出。

### 9.11 伪元素遮罩为什么不会盖住轮播内容？

**参考答案：**

遮罩 `.body::before` 的 `z-index` 为 `0`，轮播图片的 `z-index` 为 `1`。在当前定位和层叠关系下，图片位于遮罩上方。分析复杂页面时还要检查父元素是否创建了新的层叠上下文，例如 `transform`、`opacity < 1`、定位元素配合 `z-index` 等都会影响层叠结果。

### 9.12 `position: absolute` 和 `position: fixed` 的包含块有什么区别？

**参考答案：**

- `absolute` 通常相对于最近的已定位祖先元素；
- `fixed` 通常相对于视口；
- 某些祖先元素使用 `transform`、`filter` 等属性后，也可能成为 `fixed` 元素的包含块。

当前箭头使用 `fixed`，因此它更依赖整个页面的视口布局；可复用轮播组件通常更适合让按钮绝对定位在组件容器内。

### 9.13 为什么不建议用 `as any` 解决数组访问报错？

**参考答案：**

`any` 会绕过类型检查，使拼写错误、空值访问和数据结构变化无法在编译期被发现。数组访问真正的风险是索引可能越界，应通过边界约束、空值检查、可选链或明确的数据不变量解决，而不是关闭检查。

### 9.14 Vite 中 `src/assets` 与 `public` 目录有什么区别？

**参考答案：**

- `src/assets` 中的资源应通过模块导入或可静态分析的 URL 引用，让 Vite 参与依赖分析、哈希命名和构建输出；
- `public` 中的资源会按原文件名复制到构建目录根部，通常通过 `/xxx.png` 引用，不会被 Vite 模块图处理；
- 需要缓存哈希、依赖追踪的资源优先放在源码模块体系中；必须保持固定文件名或无法导入的资源才考虑 `public`。

### 9.15 如何减少轮播切换时的闪烁？

**参考答案：**

可以：

1. 预加载下一张或相邻图片；
2. 使用合适尺寸和格式的图片；
3. 配置浏览器缓存或 CDN；
4. 在图片准备完成前保留当前图；
5. 对大量图片采用按需加载，而不是一次下载全部资源；
6. 使用 `opacity` 过渡实现交叉淡化。

### 9.16 如何提高这个轮播组件的可访问性？

**参考答案：**

按钮应提供 `type` 和 `aria-label`，装饰性图标应设置 `aria-hidden="true"`；此外还应保留清晰的键盘焦点样式，支持方向键操作，向辅助技术描述当前页码，并尊重 `prefers-reduced-motion`。如果图片表达重要内容，应该使用带 `alt` 的 `<img>`；纯装饰图片才适合放在 CSS 背景中。当前页面已经完成按钮名称和装饰性箭头的基础处理。

### 9.17 `scoped` 样式是如何工作的？

**参考答案：**

Vue SFC 编译器会为当前组件模板元素和选择器附加作用域属性，使样式主要限定在当前组件内。它不是 Shadow DOM，仍然会受到全局样式、继承、CSS 优先级和深度选择器等规则影响。当前组件通过：

```vue
<style scoped lang="scss">
@use './index.scss';
</style>
```

把 SCSS 内容纳入当前 SFC 的作用域样式编译流程。

---

## 10. 一种更精简的状态设计示例

以下示例展示“单一事实来源”的思路，不代表必须立即修改当前代码：

```ts
interface Slide {
  id: number
  url: string
}

const imgList: Slide[] = [
  { id: 1, url: image001 },
  { id: 2, url: image002 },
  { id: 3, url: image003 },
  { id: 4, url: image004 },
]

const activeSlide = ref(0)

const currentSlide = computed(() => imgList[activeSlide.value])
const bgImgUrl = computed(() => currentSlide.value?.url ?? '')

function changeSlide(step: -1 | 1) {
  if (imgList.length === 0)
    return

  activeSlide.value
    = (activeSlide.value + step + imgList.length) % imgList.length
}
```

模板只根据索引判断当前项：

```vue
<div
  v-for="({ id, url }, index) in imgList"
  :key="id"
  class="slide base-main-h"
  :class="{ active: index === activeSlide }"
  :style="{ backgroundImage: `url(${url})` }"
/>
```

这一设计的优点是：

- 只有 `activeSlide` 是可变状态；
- 不再需要遍历数组重置 `active`；
- 不再需要手动同步 `bgImgUrl`；
- 更容易保证状态一致性；
- 切换逻辑由左右两个函数统一为一个函数。

---

## 11. 总结

`Day18_BackgroundSlider` 是一个以视觉效果为主的 Vue 3 轮播示例。它通过响应式索引控制当前图片，用动态背景样式保持内外图片一致，再利用 CSS 遮罩、裁剪和透明度过渡形成“背景联动”的层次感。

复习该页面时，建议重点掌握：

1. `ref`、`reactive`、模板 Ref 自动解包；
2. 响应式数组中嵌套对象的更新机制；
3. `v-for`、稳定 `key`、动态类名和动态样式；
4. 轮播索引的首尾循环与空数组边界；
5. 单一事实来源和派生状态设计；
6. `cover`、`overflow: hidden`、定位和层叠关系；
7. `opacity` 过渡与背景图切换的区别；
8. Vite 静态资源处理与生产环境路径；
9. TypeScript 数组越界检查及避免滥用 `any`；
10. 图片性能、组件复用性和无障碍设计。
