# Day11：Event KeyCodes 页面说明与面试复习

## 1. 页面概览

- **路由地址**：`/day11`
- **路由名称**：`day11`
- **页面标题**：`Event KeyCodes`
- **页面组件**：`src/views/Day11_EventKeyCodes/index.vue`
- **样式文件**：`src/views/Day11_EventKeyCodes/index.scss`

这个页面是一个键盘事件演示工具：用户按下任意键后，页面会读取浏览器产生的 `KeyboardEvent`，并展示以下三个字段：

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `event.key` | 当前按键实际产生的字符或按键含义 | `a`、`A`、`Enter`、`ArrowLeft` |
| `event.keyCode` | 旧式数字键值 | `65`、`13`、`37` |
| `event.code` | 键盘上的物理按键位置 | `KeyA`、`Enter`、`ArrowLeft` |

页面的主要学习目标不是业务功能，而是帮助理解：

1. 浏览器键盘事件的触发方式；
2. `key`、`code`、`keyCode` 的区别；
3. DOM 事件捕获、默认行为和传播控制；
4. Vue 3 Composition API 的响应式状态如何驱动模板更新；
5. 全局事件监听器的注册与清理。

---

## 2. 页面运行流程

### 2.1 初始状态

组件创建了一个布尔状态：

```ts
const flag = ref(false)
```

当 `flag` 为 `false` 时，模板显示提示语：

```text
Press any key to get the keyCode
```

此时还没有展示任何具体的键盘信息。

### 2.2 监听键盘事件

页面在 `window` 上注册了一个 `keydown` 监听器：

```ts
window.addEventListener('keydown', handlerKeyDown, { capture: true })
```

这里有三个重要信息：

- 监听目标是 `window`，因此只要该组件存在，页面中任何位置产生的键盘事件都可能被捕获；
- 监听的是 `keydown`，按键刚被按下时就会触发；
- `capture: true` 表示监听器在**捕获阶段**执行。

### 2.3 按键后的处理

事件处理函数会执行以下操作：

```ts
function handlerKeyDown(e: KeyboardEvent) {
  flag.value = true
  e.preventDefault()
  e.stopImmediatePropagation()

  keyInfo.key = e.key
  keyInfo.keyCode = e.keyCode
  keyInfo.code = e.code
}
```

完整流程可以概括为：

```text
用户按键
  ↓
window 在捕获阶段收到 keydown
  ↓
阻止浏览器默认行为
  ↓
立即停止事件传播及同一目标上的后续监听器
  ↓
将 flag 设置为 true
  ↓
把 key、keyCode、code 写入响应式对象
  ↓
Vue 更新模板，显示三个按键信息卡片
```

### 2.4 空格键的特殊显示

空格键对应的 `event.key` 不是单词 `Space`，而是一个真正的空格字符串：

```ts
event.key === ' '
```

如果直接渲染，用户几乎看不到内容，因此模板进行了转换：

```vue
{{ key === " " ? "Space" : key }}
```

这只是展示层转换，没有修改浏览器事件本身。

---

## 3. Vue 3 相关知识点

### 3.1 `<script setup>` 的作用

组件使用了：

```vue
<script setup lang="ts" vapor>
```

其中：

- `setup`：使用 Vue 3 的 `<script setup>` 编译语法；
- `lang="ts"`：脚本使用 TypeScript；
- `vapor`：该仓库启用了 Vue Vapor 编译模式。

在 `<script setup>` 中，顶层声明的变量和函数可以直接在模板中使用，不需要像传统 `setup()` 那样手动 `return`。

例如脚本中的：

```ts
const { key, keyCode, code } = toRefs(keyInfo)
```

可以直接在模板中写成：

```vue
{{ key }}
{{ keyCode }}
{{ code }}
```

### 3.2 为什么没有显式导入 `ref`、`reactive` 和 `toRefs`

源码没有写：

```ts
import { reactive, ref, toRefs } from 'vue'
```

这是因为项目在 `vite.config.ts` 中使用了 `unplugin-auto-import`：

```ts
AutoImport({
  imports: ['vue', 'vue-router'],
  dts: 'types/auto-imports.d.ts',
})
```

插件会在构建时自动处理这些 Vue API，并生成类型声明文件。

需要注意：这是项目工具链提供的能力，不是 JavaScript 或 Vue SFC 天然允许省略导入。

### 3.3 `ref` 与 `reactive` 的选择

页面同时使用了 `ref` 和 `reactive`：

```ts
const flag = ref(false)

const keyInfo = reactive<KeyItem>({
  key: '',
  keyCode: 0,
  code: '',
})
```

常见选择方式：

- 单个基本类型状态，例如布尔值、数字、字符串，常用 `ref`；
- 多个有业务关联的属性，可以组合成对象并使用 `reactive`；
- `ref` 也可以保存对象，二者并非只能这样使用，关键是团队约定和状态组织方式。

在脚本中读取或修改 `ref` 通常需要 `.value`：

```ts
flag.value = true
```

`reactive` 对象则直接读写属性：

```ts
keyInfo.key = e.key
```

### 3.4 为什么要使用 `toRefs`

如果直接解构一个响应式对象：

```ts
const { key, keyCode, code } = keyInfo
```

得到的是当时的普通属性值，后续对 `keyInfo.key` 的修改不会继续同步到已经解构出来的局部变量。

当前页面使用：

```ts
const { key, keyCode, code } = toRefs(keyInfo)
```

`toRefs` 会把响应式对象的每个属性转换成与原属性保持连接的 `Ref`。因此：

```ts
keyInfo.key = 'Enter'
```

会同步反映到 `key.value`，模板也能够更新。

这是 Vue 面试中经常出现的题目：

> `reactive` 对象直接解构为什么会丢失响应性？应该如何处理？

常见回答是使用 `toRefs`、`toRef`，或者不要脱离原响应式对象访问属性。

### 3.5 模板为什么不用写 `.value`

虽然 `key`、`keyCode`、`code` 都是 `Ref`，模板中却直接写：

```vue
{{ key }}
```

而不是：

```vue
{{ key.value }}
```

原因是 Vue 模板会对顶层 `Ref` 自动解包。脚本逻辑中仍然要按照正常的 `Ref` 规则使用 `.value`。

### 3.6 响应式更新是否立即修改 DOM

事件处理函数中对状态的赋值是同步执行的，但 Vue 通常会把 DOM 更新放入更新队列，在当前同步任务结束后批量刷新。

因此，如果在赋值后立刻读取更新后的真实 DOM，通常需要：

```ts
await nextTick()
```

这个页面只负责显示数据，不需要在处理函数里立即读取 DOM，所以不需要 `nextTick`。

### 3.7 函数写在监听器后面为什么仍然能调用

源码先注册监听器，后声明函数：

```ts
window.addEventListener('keydown', handlerKeyDown, { capture: true })

function handlerKeyDown(e: KeyboardEvent) {
  // ...
}
```

这是合法的，因为 `function` 函数声明会被提升，可以在声明位置之前引用。

如果改成没有提前声明的 `const` 函数表达式，则不能这样写：

```ts
window.addEventListener('keydown', handlerKeyDown)

const handlerKeyDown = (e: KeyboardEvent) => {
  // 此写法在完成初始化前就访问 handlerKeyDown，会出错
}
```

---

## 4. `event.key`、`event.code` 与 `event.keyCode`

这是这个页面最核心、也最容易被面试追问的知识点。

### 4.1 `event.key`

`event.key` 表示用户这次按键产生的实际字符或按键含义，会受到以下因素影响：

- Shift、Caps Lock 等修饰状态；
- 当前键盘布局；
- 输入法和语言环境；
- 具体按键是否为功能键。

示例：

| 操作 | `event.key` 可能的值 |
| --- | --- |
| 按下字母 A | `a` |
| Shift + A | `A` |
| 回车 | `Enter` |
| 左方向键 | `ArrowLeft` |
| 空格 | ` `（一个空格字符） |

适合使用 `key` 的场景：

- 判断用户输入的字符；
- 处理 Enter、Escape、Tab 等语义按键；
- 实现与键盘布局和修饰键结果相关的交互。

### 4.2 `event.code`

`event.code` 更接近键盘上的物理位置，通常不关心该位置在当前布局下最终输入了什么字符。

例如，在不同键盘布局下，同一个物理位置可能产生不同的 `key`，但 `code` 仍然可能是 `KeyA`。

适合使用 `code` 的场景：

- 游戏中的 WASD 控制；
- 依赖物理按键位置的快捷操作；
- 不希望键盘布局改变控制位置的场景。

但要注意，虚拟键盘、辅助输入设备以及部分特殊设备不一定具有稳定的物理键位语义。

### 4.3 `event.keyCode`

`event.keyCode` 是历史遗留的数字键值，例如：

```text
A     → 65
Enter → 13
Esc   → 27
```

它已经被 Web 标准标记为废弃，不应该作为新业务代码的首选方案。不同浏览器、键盘布局和特殊按键下也可能存在兼容性差异。

本页面展示 `keyCode`，主要是因为这个练习项目本身叫 **Event KeyCodes**，用于理解旧代码和历史 API。生产代码通常应该优先选择：

```ts
event.key
```

或：

```ts
event.code
```

### 4.4 如何选择

可以用一句话记忆：

> `key` 看“用户输入了什么”，`code` 看“用户按了哪个物理位置”，`keyCode` 是应尽量避免的新代码遗留方案。

例如：

```ts
// 表单按 Enter 提交，关注按键语义
if (event.key === 'Enter') {
  submit()
}

// 游戏角色使用固定物理位置移动，关注键位位置
if (event.code === 'KeyW') {
  moveForward()
}
```

---

## 5. DOM 键盘事件知识点

### 5.1 `keydown`、`keyup` 与 `keypress`

| 事件 | 触发时机 | 常见用途 |
| --- | --- | --- |
| `keydown` | 按键按下时 | 快捷键、方向控制、尽早响应 |
| `keyup` | 按键释放时 | 结束持续操作、确认完整按压 |
| `keypress` | 历史字符输入事件 | 已废弃，不建议在新代码中使用 |

按住某个键时，浏览器通常会连续触发 `keydown`，事件对象的 `repeat` 属性可以用于判断是否为长按重复：

```ts
if (event.repeat) {
  // 用户正在长按按键
}
```

### 5.2 捕获阶段、目标阶段与冒泡阶段

DOM 事件传播大致分为：

```text
window
  ↓ 捕获阶段
document
  ↓
html
  ↓
body
  ↓
目标元素
  ↑ 冒泡阶段
body
  ↑
html
  ↑
document
  ↑
window
```

当前代码使用：

```ts
{ capture: true }
```

并且监听器挂在 `window` 上，所以它会在事件传播路径非常靠前的位置执行。

这意味着当前处理器具有很强的全局拦截能力，不只是“读取一下键盘数据”。

### 5.3 `preventDefault()`

```ts
e.preventDefault()
```

作用是阻止浏览器对当前事件执行默认行为，但它不会自动停止事件传播。

可能被阻止的键盘默认行为包括：

- Tab 切换焦点；
- Space 滚动页面或激活按钮；
- 方向键滚动页面；
- 浏览器或页面内的部分快捷键；
- 输入框中的正常编辑操作。

并不是所有事件都可取消，可以通过以下属性判断：

```ts
event.cancelable
```

### 5.4 三种传播控制的区别

| API | 阻止默认行为 | 阻止向后续节点传播 | 阻止同一节点上的后续监听器 |
| --- | --- | --- | --- |
| `preventDefault()` | 是 | 否 | 否 |
| `stopPropagation()` | 否 | 是 | 否 |
| `stopImmediatePropagation()` | 否 | 是 | 是 |

当前页面调用的是：

```ts
e.stopImmediatePropagation()
```

它不仅阻止事件继续向后传播，还会阻止同一个事件目标上后注册的其他同类监听器继续执行。

由于当前监听器位于 `window` 的捕获阶段，这可能让应用中其他组件、快捷键系统和可访问性功能收不到 `keydown`。

### 5.5 `target` 与 `currentTarget`

这个页面在 `window` 上注册事件，但真正具有焦点、产生键盘事件的目标可能是输入框、按钮或其他元素。

- `event.target`：最初产生事件的目标元素；
- `event.currentTarget`：当前正在执行监听器的对象，在本页面中是 `window`。

这也是事件委托和全局快捷键面试题中常见的区别。

---

## 6. 当前实现的风险与改进方向

这个页面作为练习演示可以工作，但如果放入真实项目，至少需要关注以下问题。

### 6.1 全局监听器没有清理

当前代码直接执行：

```ts
window.addEventListener('keydown', handlerKeyDown, { capture: true })
```

但是组件卸载时没有执行 `removeEventListener`。

在单页应用中，从 `/day11` 切换到其他路由时，组件实例虽然被卸载，`window` 仍然存在。全局监听器可能继续持有组件闭包并响应按键，从而导致：

- 已离开页面，监听器却仍然运行；
- 再次进入页面后重复注册；
- 一次按键触发多个旧处理器；
- 组件状态无法被垃圾回收；
- 产生难以定位的跨页面副作用。

更稳妥的写法是让注册与组件生命周期对称：

```ts
onMounted(() => {
  window.addEventListener('keydown', handlerKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlerKeyDown)
})
```

移除监听器时需要注意：

- 事件类型必须一致；
- 函数引用必须是同一个；
- `capture` 的值必须匹配。

如果注册时必须使用捕获阶段，可以写成：

```ts
onMounted(() => {
  window.addEventListener('keydown', handlerKeyDown, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlerKeyDown, true)
})
```

### 6.2 对所有按键一律阻止默认行为

当前代码无条件调用：

```ts
e.preventDefault()
```

这会破坏正常键盘操作，尤其是 Tab、Space、方向键和输入框输入，也会影响只使用键盘或辅助技术的用户。

如果页面只是展示事件信息，通常根本不需要阻止默认行为。只有在应用确实接管某个具体快捷键时，才应在精确条件下调用：

```ts
if (e.key === 'ArrowDown' && menuIsOpen.value) {
  e.preventDefault()
  focusNextItem()
}
```

### 6.3 `stopImmediatePropagation()` 的影响过大

这个页面只需要读取事件数据，通常不需要阻断整个应用的事件系统。

如果没有明确的冲突处理需求，应删除：

```ts
e.stopImmediatePropagation()
```

即使确实要限制事件，也应先判断 `stopPropagation()` 是否已经足够，并尽量把监听范围缩小到组件容器，而不是在 `window` 捕获阶段拦截。

### 6.4 使用了废弃的 `keyCode`

为了演示旧 API 可以保留，但文案应明确标注为 legacy/deprecated。真实快捷键判断不应继续依赖它。

### 6.5 直接访问 `window` 不兼容 SSR

`window` 只存在于浏览器环境。当前项目是客户端 Vite SPA，所以运行时通常没有问题；如果组件参与服务端渲染，模块执行到这行时会出现：

```text
ReferenceError: window is not defined
```

把访问放入 `onMounted` 后，代码只会在浏览器挂载阶段运行，也更符合生命周期语义。

### 6.6 输入法组合状态

中文、日文等输入法在组合输入期间可能产生键盘事件。业务代码有时需要判断：

```ts
if (event.isComposing) {
  return
}
```

是否忽略组合状态取决于业务：

- 单纯的事件观察器可以继续展示；
- Enter 提交、快捷键等业务通常需要避免误触发。

### 6.7 长按重复

按住按键会重复触发 `keydown`。如果业务只希望一次按压处理一次，可以使用：

```ts
if (event.repeat) {
  return
}
```

本演示重复写入相同状态通常问题不大，但游戏移动等场景可能反而会主动利用重复触发。

### 6.8 监听范围可以更小

如果功能只属于这个演示区域，可以考虑：

1. 给容器设置 `tabindex="0"`，让容器可获得焦点；
2. 在容器上使用 Vue 事件绑定；
3. 只在用户聚焦该区域后读取键盘事件。

例如：

```vue
<div
  class="body base_container"
  tabindex="0"
  @keydown="handlerKeyDown"
>
  <!-- ... -->
</div>
```

这样可以减少全局副作用，但需要同时设计清晰的焦点状态和可访问性提示。

---

## 7. 一个更接近生产代码的版本

下面的示例仍然实现“按键后展示 `key` 和 `code`”，但修复了全局监听器清理、SSR 和过度拦截问题：

```vue
<script setup lang="ts">
interface KeyInfo {
  key: string
  code: string
}

const hasPressed = ref(false)

const keyInfo = reactive<KeyInfo>({
  key: '',
  code: '',
})

const { key, code } = toRefs(keyInfo)

function handleKeyDown(event: KeyboardEvent) {
  if (event.isComposing) {
    return
  }

  hasPressed.value = true
  keyInfo.key = event.key
  keyInfo.code = event.code
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
```

关键变化：

- 不再使用已经废弃的 `keyCode`；
- 不无条件阻止浏览器默认行为；
- 不阻断其他监听器；
- 在 `onMounted` 中注册；
- 在 `onUnmounted` 中使用同一个函数引用移除监听器；
- 根据业务选择忽略输入法组合阶段。

如果页面的教学目的就是对比三个字段，也可以继续展示 `keyCode`，但应该明确标记其已废弃，而不是用它实现业务判断。

---

## 8. 高频面试题与参考答案

### 问题 1：这个页面的核心功能是什么？

监听浏览器的 `keydown` 事件，读取 `KeyboardEvent` 的 `key`、`keyCode` 和 `code`，再通过 Vue 响应式状态把它们展示到页面上。

### 问题 2：`event.key` 与 `event.code` 有什么区别？

`key` 表示本次按键产生的字符或语义，会受到键盘布局和 Shift 等修饰状态影响；`code` 更接近物理按键位置，适合游戏控制等依赖键位位置的场景。

### 问题 3：为什么不推荐使用 `keyCode`？

它已经废弃，语义不够清晰，并且在不同浏览器、布局和特殊按键下可能不一致。新代码应根据需求使用 `key` 或 `code`。

### 问题 4：为什么使用 `keydown`，不用 `keyup`？

`keydown` 在按下时立即触发，响应更早，也支持长按重复；`keyup` 要等按键释放，更适合结束持续动作或确认完成一次按压。选择取决于交互语义。

### 问题 5：`keypress` 还能用吗？

不建议。`keypress` 已废弃，新代码通常使用 `keydown`、`keyup`，文本输入还可以结合 `input`、`beforeinput` 和输入法组合事件处理。

### 问题 6：`preventDefault()` 与 `stopPropagation()` 有什么区别？

`preventDefault()` 阻止浏览器默认行为，但不阻止传播；`stopPropagation()` 阻止事件继续沿传播路径移动，但不阻止默认行为。二者解决的是不同问题。

### 问题 7：`stopPropagation()` 与 `stopImmediatePropagation()` 有什么区别？

二者都会阻止事件继续传播；`stopImmediatePropagation()` 还会阻止当前事件目标上后续注册的同类监听器执行，因此影响更强。

### 问题 8：`capture: true` 有什么作用？

它让监听器在捕获阶段执行，而不是使用默认的冒泡阶段。当前监听器挂在 `window` 上，因此会非常早地收到事件。

### 问题 9：为什么全局事件需要在组件卸载时清理？

`window` 的生命周期通常比组件长。组件卸载并不会自动移除手动注册的原生监听器，可能造成重复处理、跨路由副作用和内存无法释放。

### 问题 10：为什么 `removeEventListener` 有时移除失败？

常见原因是没有传入同一个函数引用，或者注册与移除时的 `capture` 不一致。例如下面两次箭头函数不是同一个对象：

```ts
window.addEventListener('keydown', () => doSomething())
window.removeEventListener('keydown', () => doSomething())
```

正确方式是保存稳定引用：

```ts
const handleKeyDown = () => doSomething()

window.addEventListener('keydown', handleKeyDown)
window.removeEventListener('keydown', handleKeyDown)
```

### 问题 11：`ref` 与 `reactive` 有什么区别？

`ref` 用 `.value` 保存值，可以包装基本类型或对象；`reactive` 返回对象的响应式代理，只适用于对象类值。模板会自动解包顶层 `Ref`。实际选择还与状态组织和团队规范有关。

### 问题 12：为什么 `reactive` 对象直接解构可能丢失响应性？

直接解构会把属性当前的值取出来，局部变量不再通过原代理访问属性。可以使用 `toRefs`/`toRef` 保持连接，或者继续通过原响应式对象读取属性。

### 问题 13：为什么模板里不用写 `flag.value`？

Vue 模板会自动解包顶层 `Ref`；JavaScript/TypeScript 脚本中通常仍然需要 `.value`。

### 问题 14：按住一个键为什么会连续更新？

浏览器会产生重复的 `keydown`，可以通过 `event.repeat` 判断。是否忽略重复事件要根据业务需求决定。

### 问题 15：如何避免输入法回车误触发表单提交？

需要关注输入法组合状态，可结合 `event.isComposing`、`compositionstart` 和 `compositionend` 判断用户是否仍在组合输入。

### 问题 16：这个组件放到 SSR 项目有什么问题？

组件初始化时直接访问了 `window`，服务端没有该对象，会抛出错误。应该在 `onMounted` 等仅客户端执行的生命周期中访问，或者先判断运行环境。

### 问题 17：`event.target` 和 `event.currentTarget` 在这里分别是什么？

`target` 通常是当前获得焦点并产生事件的具体元素；`currentTarget` 是正在执行监听器的对象，在当前实现里是 `window`。

### 问题 18：为什么页面把空格单独显示为 `Space`？

空格的 `event.key` 是一个空格字符，直接渲染不易观察，所以模板将它转换为可见文本。这是展示处理，不是标准 API 返回值发生了变化。

### 问题 19：修改响应式数据后，DOM 会同步立即更新吗？

状态赋值本身同步执行，但 Vue 会调度和批量执行 DOM 更新。如果后续逻辑必须读取更新后的真实 DOM，应等待 `nextTick()`。

### 问题 20：如何测试这个页面？

可以分层测试：

1. 构造 `KeyboardEvent`，调用或触发处理器，断言状态和渲染文本；
2. 验证空格是否显示为 `Space`；
3. 验证 Enter、方向键和字母的 `key`/`code`；
4. 验证组件卸载后监听器不再响应；
5. 用端到端测试验证真实页面按键交互；
6. 检查 Tab、Space 等键的默认行为是否被意外破坏。

---

## 9. 面试时可以怎样概括这个页面

可以用下面这段话快速回答：

> 这是一个 Vue 3 键盘事件演示页面。组件在 `window` 上监听 `keydown`，把 `KeyboardEvent` 的 `key`、`keyCode` 和 `code` 写入响应式对象，并通过 `toRefs` 保持解构后的响应性，再由模板展示。`key` 表示输入结果或按键语义，`code` 表示物理键位，`keyCode` 已废弃。当前实现使用了捕获阶段，并调用 `preventDefault` 和 `stopImmediatePropagation`，会对全局键盘交互产生较强副作用；同时监听器没有在组件卸载时清理。生产实现应使用 `onMounted`/`onUnmounted` 对称管理监听器，优先使用 `key` 或 `code`，并只在必要条件下阻止默认行为。

---

## 10. 复习清单

- [ ] 能说明页面从按键到视图更新的完整流程；
- [ ] 能区分 `key`、`code` 和 `keyCode`；
- [ ] 知道 `keyCode` 已废弃；
- [ ] 能区分 `keydown`、`keyup` 和已废弃的 `keypress`；
- [ ] 能解释捕获、目标和冒泡阶段；
- [ ] 能区分 `preventDefault`、`stopPropagation`、`stopImmediatePropagation`；
- [ ] 能说明 `ref`、`reactive`、`toRefs` 和模板自动解包；
- [ ] 知道全局事件监听器必须随组件生命周期清理；
- [ ] 知道 `removeEventListener` 需要相同函数引用和匹配的 `capture`；
- [ ] 能考虑 SSR、输入法组合、长按重复和键盘可访问性。
