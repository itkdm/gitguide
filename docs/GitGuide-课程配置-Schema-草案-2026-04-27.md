# GitGuide 课程配置 Schema 草案

## 文档目的

本文档用于定义 GitGuide MVP 的课程配置结构、步骤配置结构、分支结构、多语言文案结构和本地进度数据结构，作为前端实现配置驱动课程系统的基础约束。

---

## 1. 设计目标

第一版 Schema 需要满足以下目标：

* 能描述 3 节 MVP 课程
* 能支持单线步骤和分支步骤
* 能支持中英文整站切换
* 能支持页面引导和高亮目标
* 能支持本地进度恢复
* 能尽量简单，避免过早设计过重

因此第一版建议采用：

* `course` 描述课程
* `step` 描述步骤
* `locale` 描述多语言文案
* `scene` 描述课程使用的模拟页面
* `progress` 描述本地学习状态

---

## 2. 顶层结构建议

建议第一版课程配置文件采用如下顶层结构：

```ts
type CourseCatalog = {
  version: string
  defaultLanguage: LanguageCode
  courses: CourseConfig[]
}
```

说明：

* `version` 用于后续配置升级
* `defaultLanguage` 对应当前已确定的默认英文
* `courses` 是全部课程列表

语言枚举建议：

```ts
type LanguageCode = 'en' | 'zh'
```

---

## 3. 课程结构

### 3.1 CourseConfig

```ts
type CourseConfig = {
  id: string
  slug: string
  order: number
  sceneId: string
  completionMode: CompletionMode
  resettable: boolean
  estimatedMinutes: number
  title: LocalizedText
  summary: LocalizedText
  goals: LocalizedList
  entryStepId: string
  steps: StepConfig[]
  glossary?: GlossaryTermRef[]
  completion?: CourseCompletionConfig
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 课程唯一 ID |
| `slug` | 路由标识 |
| `order` | 学习路径顺序 |
| `sceneId` | 对应模拟场景 |
| `completionMode` | 完成模式 |
| `resettable` | 是否可重学 |
| `estimatedMinutes` | 预计时长 |
| `title` | 课程标题 |
| `summary` | 课程简介 |
| `goals` | 学习目标列表 |
| `entryStepId` | 课程入口步骤 |
| `steps` | 课程步骤数组 |
| `glossary` | 本课关联术语 |
| `completion` | 完成页配置 |

完成模式建议：

```ts
type CompletionMode = 'all' | 'any-branch'
```

MVP 对应关系：

* `repository-basics` 使用 `all`
* `download-code` 使用 `any-branch`
* `create-repository` 使用 `all`

---

### 3.2 LocalizedText

```ts
type LocalizedText = {
  en: string
  zh: string
}
```

列表文案建议：

```ts
type LocalizedList = {
  en: string[]
  zh: string[]
}
```

说明：

* 第一版直接固定 `en` 和 `zh`
* 不必一开始做动态语言键
* 对 MVP 来说更直观也更易维护

---

## 4. 步骤结构

### 4.1 StepConfig

```ts
type StepConfig = {
  id: string
  type: StepType
  title: LocalizedText
  instruction: LocalizedText
  hint?: LocalizedText
  targetId?: string
  action?: StepActionConfig
  successRule: StepSuccessRule
  next?: StepTransition
  optional?: boolean
  meta?: Record<string, string | number | boolean>
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 步骤唯一 ID |
| `type` | 步骤类型 |
| `title` | 步骤标题 |
| `instruction` | 步骤主说明 |
| `hint` | 轻提示 |
| `targetId` | 页面目标元素 ID |
| `action` | 用户动作定义 |
| `successRule` | 成功判定 |
| `next` | 下一步或分支跳转 |
| `optional` | 是否可选 |
| `meta` | 扩展信息 |

步骤类型建议：

```ts
type StepType =
  | 'click'
  | 'input'
  | 'select'
  | 'observe'
  | 'confirm'
  | 'branch'
  | 'complete'
```

说明：

* `observe` 适合“认识仓库页面”的识别型步骤
* `branch` 适合“下载代码”的分支选择节点
* `complete` 适合课程结束步骤

---

### 4.2 StepActionConfig

```ts
type StepActionConfig = {
  kind: ActionKind
  expectedValue?: string
  allowedValues?: string[]
  allowFreeInput?: boolean
}
```

动作类型建议：

```ts
type ActionKind = 'click' | 'input' | 'select' | 'toggle' | 'confirm'
```

使用示例：

* 点击 `Code` 按钮：`kind: 'click'`
* 输入仓库名称：`kind: 'input'`
* 选择 `Public/Private`：`kind: 'select'`
* 勾选 README：`kind: 'toggle'`

---

### 4.3 StepSuccessRule

```ts
type StepSuccessRule = {
  type: SuccessRuleType
  targetId?: string
  expectedValue?: string
  minLength?: number
  branchKey?: string
}
```

成功规则类型建议：

```ts
type SuccessRuleType =
  | 'target-clicked'
  | 'input-filled'
  | 'value-selected'
  | 'toggle-changed'
  | 'branch-entered'
  | 'manual-confirm'
```

使用示例：

* 点击目标区域成功：`target-clicked`
* 输入任意非空仓库名称：`input-filled`
* 进入 ZIP 分支：`branch-entered`
* 用户点击“我明白了”：`manual-confirm`

---

### 4.4 StepTransition

```ts
type StepTransition =
  | {
      type: 'linear'
      nextStepId: string
    }
  | {
      type: 'branch'
      branches: BranchTransition[]
    }
  | {
      type: 'complete'
    }
```

分支跳转结构：

```ts
type BranchTransition = {
  key: string
  label: LocalizedText
  nextStepId: string
}
```

说明：

* 线性课程用 `linear`
* 下载代码用 `branch`
* 最终结束步骤用 `complete`

---

## 5. 场景结构

课程配置要和页面场景解耦，因此建议单独维护 `sceneId`。

### 5.1 SceneConfig

```ts
type SceneConfig = {
  id: string
  kind: SceneKind
  targetMap: Record<string, SceneTargetConfig>
}
```

场景类型建议：

```ts
type SceneKind =
  | 'repository-overview'
  | 'download-code'
  | 'create-repository'
```

目标元素结构：

```ts
type SceneTargetConfig = {
  id: string
  role: string
  label: LocalizedText
}
```

说明：

* `targetId` 用于步骤高亮
* 页面组件里只要保证对应元素带上相同 ID 即可
* 配置层不需要关心具体 DOM 实现细节

---

## 6. 完成页配置

### 6.1 CourseCompletionConfig

```ts
type CourseCompletionConfig = {
  title: LocalizedText
  summary: LocalizedText
  learnedPoints: LocalizedList
  nextCourseId?: string
  bonusMessage?: LocalizedText
}
```

说明：

* 课程完成页尽量也走配置
* `download-code` 可以通过 `bonusMessage` 展示“两条路径都掌握了”

---

## 7. 术语结构

第一版不需要单独做复杂术语系统，但可以预留引用能力。

### 7.1 GlossaryTermRef

```ts
type GlossaryTermRef = {
  key: string
}
```

如果要内嵌词条，也可以先用：

```ts
type GlossaryTerm = {
  key: string
  term: LocalizedText
  description: LocalizedText
}
```

MVP 常用词建议：

* `repository`
* `readme`
* `issue`
* `fork`
* `clone`
* `pull-request`

---

## 8. 本地进度结构

### 8.1 AppProgress

```ts
type AppProgress = {
  version: string
  language: LanguageCode
  lastVisitedCourseId?: string
  lastVisitedStepId?: string
  courses: Record<string, CourseProgress>
}
```

---

### 8.2 CourseProgress

```ts
type CourseProgress = {
  courseId: string
  status: CourseProgressStatus
  activeStepId?: string
  completedStepIds: string[]
  selectedBranch?: string
  completedBranches?: string[]
  startedAt?: string
  completedAt?: string
}
```

课程状态建议：

```ts
type CourseProgressStatus = 'not_started' | 'in_progress' | 'completed'
```

说明：

* 时间建议先用 ISO 字符串
* `download-code` 才需要 `selectedBranch` 和 `completedBranches`
* 其他课程对应字段可以为空

---

## 9. 推荐存储方式

第一版建议在本地存两类数据：

1. 静态课程配置
2. 动态学习进度

建议方式：

* 课程配置：放在本地 `ts/json` 文件
* 学习进度：放在 `localStorage`

本地存储键建议：

```ts
const STORAGE_KEYS = {
  progress: 'gitguide.progress.v1',
  language: 'gitguide.language.v1'
}
```

说明：

* 可以把语言单独存，也可以全部并入 `progress`
* 若统一放进 `progress`，数据读取更集中

我更推荐：

* 只保留一个 `gitguide.progress.v1`

因为这样恢复逻辑更简单。

---

## 10. 三节课的配置示例

以下不是最终数据，而是帮助开发对齐结构。

### 10.1 课程一：认识仓库页面

```ts
const repositoryBasicsCourse: CourseConfig = {
  id: 'course_repository_basics',
  slug: 'repository-basics',
  order: 1,
  sceneId: 'scene_repository_overview',
  completionMode: 'all',
  resettable: true,
  estimatedMinutes: 5,
  title: {
    en: 'Understand a Repository Page',
    zh: '认识仓库页面'
  },
  summary: {
    en: 'Learn the main areas of a repository page.',
    zh: '学习仓库页面的主要区域。'
  },
  goals: {
    en: ['Find the repository title', 'Find the README', 'Find the Code button'],
    zh: ['找到仓库标题', '找到 README', '找到 Code 按钮']
  },
  entryStepId: 'repo_step_title',
  steps: []
}
```

---

### 10.2 课程二：下载代码

```ts
const downloadCodeCourse: CourseConfig = {
  id: 'course_download_code',
  slug: 'download-code',
  order: 2,
  sceneId: 'scene_download_code',
  completionMode: 'any-branch',
  resettable: true,
  estimatedMinutes: 6,
  title: {
    en: 'Download Code',
    zh: '下载代码'
  },
  summary: {
    en: 'Learn two common ways to get code from a repository.',
    zh: '学习获取仓库代码的两种常见方式。'
  },
  goals: {
    en: ['Open the Code menu', 'Try ZIP download or Clone'],
    zh: ['打开 Code 菜单', '尝试 ZIP 下载或 Clone']
  },
  entryStepId: 'download_step_open_code',
  steps: []
}
```

---

### 10.3 课程三：创建仓库

```ts
const createRepositoryCourse: CourseConfig = {
  id: 'course_create_repository',
  slug: 'create-repository',
  order: 3,
  sceneId: 'scene_create_repository',
  completionMode: 'all',
  resettable: true,
  estimatedMinutes: 6,
  title: {
    en: 'Create a Repository',
    zh: '创建仓库'
  },
  summary: {
    en: 'Practice creating your first repository.',
    zh: '练习创建你的第一个仓库。'
  },
  goals: {
    en: ['Enter a repository name', 'Choose visibility', 'Create the repository'],
    zh: ['填写仓库名称', '选择可见性', '创建仓库']
  },
  entryStepId: 'create_step_enter_name',
  steps: []
}
```

---

## 11. 下载代码分支示例

为了让“用户点击 Code 后自主选择路径”可配置，建议像这样表示：

```ts
const chooseDownloadMethodStep: StepConfig = {
  id: 'download_step_choose_branch',
  type: 'branch',
  title: {
    en: 'Choose a way to get the code',
    zh: '选择获取代码的方式'
  },
  instruction: {
    en: 'You can download a ZIP file or copy the clone URL.',
    zh: '你可以下载 ZIP 压缩包，也可以复制 Clone 地址。'
  },
  successRule: {
    type: 'branch-entered'
  },
  next: {
    type: 'branch',
    branches: [
      {
        key: 'zip',
        label: {
          en: 'Download ZIP',
          zh: '下载 ZIP'
        },
        nextStepId: 'download_step_zip_click'
      },
      {
        key: 'clone',
        label: {
          en: 'Use Git Clone',
          zh: '使用 Git Clone'
        },
        nextStepId: 'download_step_clone_copy'
      }
    ]
  }
}
```

这个结构的好处：

* 页面逻辑清晰
* 分支信息显式存在配置里
* 课程完成规则可以直接读配置

---

## 12. 第一版实现边界建议

为了避免一开始 Schema 过重，第一版建议暂时不做：

* 条件表达式引擎
* 任意复杂嵌套分支
* 多场景动态切换
* 服务端配置下发
* 实时 A/B 文案配置

第一版优先保证：

* 结构清晰
* 类型稳定
* 足够支撑 3 节课
* 易于前端直接消费

---

## 13. 建议的目录结构

如果前端项目开始搭建，建议课程配置按如下方式组织：

```txt
src/
  content/
    courses/
      repository-basics.ts
      download-code.ts
      create-repository.ts
    scenes/
      repository-overview.ts
      download-code.ts
      create-repository.ts
    glossary/
      index.ts
  types/
    course.ts
    progress.ts
  lib/
    progress-storage.ts
    course-engine.ts
```

这样有几个好处：

* 内容配置和页面组件分离
* 类型定义集中
* 本地进度逻辑独立
* 后续新增课程成本低

---

## 14. 建议的下一步

到这一步，建议的工程顺序是：

1. 先把 `types` 定下来
2. 再写 3 节课的最小配置
3. 再实现本地 `progress-storage`
4. 再实现一个最小可运行的 `course-engine`
5. 最后把课程页面接到配置系统上

如果继续往下补文档，下一份最适合的是：

* `GitGuide 前端技术方案草案`
* 或 `GitGuide MVP UI 组件清单`
