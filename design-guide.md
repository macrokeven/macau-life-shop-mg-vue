---

## 0) 目标体验（你喜欢的那种感觉）

* **白底高密度信息**也不压迫：靠留白、层级、动效让眼睛“会呼吸”
* **交互反馈永远及时**：hover/press/focus/加载/成功/失败都明确
* **动效不炫技**：短、轻、有目的；让用户更快理解“发生了什么”

---

## 1) 动效系统（Motion System）——最核心的一套“手感参数”

### 1.1 动效时长（Duration Tokens）

建议全站统一这 4 档（后台最实用）：

* `fast`: 120ms（hover 高亮、icon 变色、光标反馈）
* `base`: 180ms（按钮按下、输入框聚焦、下拉展开）
* `slow`: 240ms（卡片浮起、行 hover、轻量布局变化）
* `modal`: 320ms（抽屉/弹窗进出、页面切换）

### 1.2 缓动曲线（Easing Tokens）

不要全站都用 `ease`，会显“廉价”。建议固定三条曲线：

* **标准**（大多数 UI）：`cubic-bezier(.2,.8,.2,1)`
* **加速离场**（关闭/收起）：`cubic-bezier(.4,0,1,1)`
* **减速入场**（打开/出现）：`cubic-bezier(0,0,.2,1)`

### 1.3 位移与缩放（Transform Tokens）

后台动效要克制：**位移 6–12px** 就够高级。

* 内容淡入：`translateY(8px)` + `opacity 0→1`
* 抽屉：`translateX(16px)`（从右）+ `backdrop blur(2px)`（可选）
* 轻微按压：`scale(0.98)`（按钮/卡片/可点击块）

### 1.4 统一动效变量（直接可用）

```css
:root{
  --d-fast:120ms; --d-base:180ms; --d-slow:240ms; --d-modal:320ms;
  --ease-std:cubic-bezier(.2,.8,.2,1);
  --ease-in:cubic-bezier(0,0,.2,1);
  --ease-out:cubic-bezier(.4,0,1,1);
}
```

### 1.5 尊重“减少动效”（高级感的一部分）

```css
@media (prefers-reduced-motion: reduce){
  *{ animation: none !important; transition: none !important; scroll-behavior:auto !important; }
}
```

---

## 2) 交互层级（Interaction Hierarchy）——让用户“看得懂、点得准”

### 2.1 点击目标尺寸（Hit Area）

* 所有可点区域 **最小高度 40px**（移动端友好，桌面端也舒服）
* 图标按钮给 **36–40px 正方形 hit area**，别只给 16px icon

### 2.2 状态必须齐全（State Completeness）

每个可交互组件必须具备：

* `default / hover / active(press) / focus / disabled / loading / error`
  少一个，体验就会“散”。

### 2.3 Focus Ring（键盘用户 + 专业感）

白底后台最推荐的 focus 样式：

* 2px 外描边（品牌色透明 20%-30%）
* 内层 1px 实线边框（品牌色）

```css
.focus-ring:focus-visible{
  outline: 2px solid rgba(0,173,145,.25);
  outline-offset: 2px;
  box-shadow: 0 0 0 1px #00AD91 inset;
}
```

---

## 3) 微交互（Micro-interactions）——“高级感主要来自这里”

### 3.1 按钮（Button）

**推荐手感：hover 轻浮起、press 轻按下、loading 不抖动布局**

* Hover：背景/边框变色 + 阴影增强 + `translateY(-1px)`
* Press：阴影减弱 + `scale(0.98)`
* Loading：按钮宽度保持不变，内部文字淡出，spinner 淡入（避免跳）

```css
.btn{
  transition: transform var(--d-base) var(--ease-std),
              box-shadow var(--d-base) var(--ease-std),
              background var(--d-fast) var(--ease-std),
              border-color var(--d-fast) var(--ease-std);
}
.btn:hover{ transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.btn:active{ transform: scale(.98); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
```

### 3.2 卡片（Card）与可点击列表项

* Hover：边框从 `#E5E6EB` → 带一点品牌色气息（不必纯绿，低饱和更高级）
* Hover 时右上角“更多/操作”按钮**淡入**（opacity 0→1），避免常驻造成噪音
* 点击进入详情：卡片轻缩放 + 页面主内容淡入（让用户确认“跳转成功”）

### 3.3 Tooltip / Popover

* 出现：`opacity + translateY(4px)`，`base 180ms`
* 消失：更快一点 `120ms`（避免拖泥带水）
* 关键：**边缘自动翻转**、**跟随视口**、**避免遮挡目标字段**

---

## 4) 后台“最关键三件套”交互：表格 / 表单 / 筛选

### 4.1 表格（Table）——做出“企业级专业味”

必配能力（你做运营后台非常吃这套）：

1. **Sticky Header**（表头固定）
2. 行 hover：整行轻高亮 `rgba(0,173,145,0.08)`
3. 操作列：默认隐藏（opacity 0），hover 行才出现
4. 选中行：左侧出现 3px 品牌色条（非常清晰）
5. 批量操作：勾选后顶部出现“批量操作浮条”（slide down + fade）

“高级手感细节”：

* 排序时表头 icon 旋转/切换有 120ms 过渡
* 数据刷新：表格不要全白屏，优先 **骨架屏或行级 shimmer**
* 大数据：滚动要稳，建议虚拟列表（否则卡顿毁体验）

### 4.2 筛选（Filter）——别让用户“找不到入口”

推荐结构（极好用）：

* 顶部：**搜索框 + 常用筛选 chips（可一键清除）**
* 右侧：**高级筛选抽屉**（保存筛选方案/常用筛选）
* 已生效条件：显示为 chips，可单独 x 掉
* 清空：提供“清空全部”但别放危险位置（避免误触）

动效建议：

* chips 进入：`scale(0.98→1)` + `opacity`，120–180ms
* 抽屉打开：遮罩淡入 + 面板滑入，320ms

### 4.3 表单（Form）——“顺滑”来自即时反馈与容错

强烈建议你用这些规则（会明显提升高级感）：

* **即时校验但不打断**：输入中只提示轻量 help；离焦或提交才显示 error
* 错误提示出现方式：`height auto + opacity`（不要抖动位移太大）
* 自动格式化：金额/手机号/日期（减少用户输入成本）
* 提交后：

    * 成功：toast + 按钮回弹 + 表格局部刷新
    * 失败：定位到错误字段 + 自动滚动 + 将焦点聚焦到第一个错误项

---

## 5) 全局反馈体系（Feedback）——用户永远知道“系统在干嘛”

### 5.1 Toast / Notice

位置推荐：右上角（不遮挡内容）

* 成功：1800ms 自动消失
* 警告：3000–5000ms
* 错误：不自动消失或 8000ms，并提供“查看详情”

动效：右上角滑入 `translateX(12px)` + fade，180ms

### 5.2 Loading 规范（避免“白屏焦虑”）

* **轻量加载（< 800ms）**：局部 skeleton，不要全屏 spinner
* **中等加载（0.8–2s）**：局部 skeleton + “正在加载…”
* **长任务（> 2s）**：必须给进度/阶段提示（例如：导出中 35% / 正在生成文件）

### 5.3 空状态（Empty State）

空态别只写“暂无数据”，要给用户下一步：

* “暂无订单” + “去创建/去导入/调整筛选条件”
* 可带一条轻插画，但要浅灰线性风（白底不突兀）

---

## 6) 导航与信息架构（IA）——用起来“像 Apple 那种顺”

### 6.1 侧边栏

* 支持：折叠（只留 icon）+ tooltip 显示标题
* 当前菜单：左侧 3px 品牌色条 + 背景微高亮
* 二级菜单展开：高度动画 180ms（不要瞬开）

### 6.2 面包屑 + 页面标题

* 左上：面包屑（可返回上级）
* 主标题旁边放：状态 tag / 快捷操作（新增、导出、刷新）

### 6.3 Command Palette（非常加分）

做一个 `⌘K / Ctrl+K` 的全局命令面板：

* 搜索菜单、创建动作、跳转常用页面
* 这是最“高级”的后台体验之一

---

## 7) 视觉细节（白色主题的“层次感”秘诀）

白底后台要看起来高级，靠这三件事：

1. **灰阶分层**：背景白 / 卡片白 / 分区浅灰（`#F7F8FA`）
2. **阴影克制**：只在 hover 或浮层用明显阴影
3. **边框更重要**：用 1px 低对比边框建立结构

推荐阴影 3 档（统一使用）：

* `s1`: `0 1px 3px rgba(0,0,0,.06)`
* `s2`: `0 6px 18px rgba(0,0,0,.08)`
* `s3`: `0 12px 34px rgba(0,0,0,.12)`（modal / dropdown）

---

## 8) 你可以直接抄的“交互验收清单”（上线前一项项对）

* [ ] 所有按钮 hover/press/focus/disabled/loading 完整
* [ ] 表格支持：sticky header、行 hover、批量操作条、局部 loading
* [ ] 筛选可视化：已生效条件 chips、清空全部、保存方案（可选）
* [ ] 表单：离焦校验 + 提交聚焦到首个错误字段
* [ ] 全局：toast 规范、空态带行动按钮、骨架屏替代白屏
* [ ] 支持减少动效（prefers-reduced-motion）
* [ ] 关键操作有二次确认（删除/退款/结算/清空）

---
