import type { CourseConfig, CourseId, LocalizedText } from './types'

export const brand = {
  en: 'GitGuide | Learn GitHub by Doing',
  zh: 'GitGuide | 边点边学 GitHub'
}

export const t = (value: LocalizedText, language: 'en' | 'zh') => value[language]

export const courses: CourseConfig[] = [
  {
    id: 'repository-basics',
    slug: 'repository-basics',
    order: 1,
    duration: 5,
    title: { en: 'Step 1: Read a Repository', zh: '第 1 课：看懂仓库页面' },
    summary: { en: 'Learn to identify parts of a GitHub repository.', zh: '学习认识 GitHub 仓库页面的各个区域。' },
    goals: [
      { en: 'Find the README file', zh: '找到项目说明(README)' },
      { en: 'View the files section', zh: '查看项目文件列表' }
    ],
    completionMode: 'all',
    steps: [
      {
        id: 'repo-find-readme',
        title: { en: 'Find the README', zh: '找到项目说明(README)' },
        detail: { en: 'Scroll down or click the README section to see what this project is about.', zh: '向下滚动或点击 README 区域，查看这个项目的介绍。' },
        targetId: 'repo-readme'
      },
      {
        id: 'repo-find-files',
        title: { en: 'Find project files', zh: '找到项目文件' },
        detail: { en: 'Locate the file list above the README.', zh: '然后在 README 的上方区域找到项目文件列表。' },
        targetId: 'repo-files'
      }
    ]
  },
  {
    id: 'download-code',
    slug: 'download-code',
    order: 2,
    duration: 5,
    title: { en: 'Step 2: Get Code', zh: '第 2 课：获取代码' },
    summary: { en: 'Download the source code via ZIP or Clone.', zh: '通过下载 ZIP 或克隆的方式获取项目源代码。' },
    goals: [
      { en: 'Click the Code button', zh: '点击 Code 按钮' },
      { en: 'Download ZIP or Clone', zh: '完成 ZIP 下载或复制 Clone 链接' }
    ],
    completionMode: 'any-branch',
    steps: [
      {
        id: 'download-open-code',
        title: { en: 'Open the Code menu', zh: '打开 Code 菜单' },
        detail: { en: 'Click the green Code button to see download options.', zh: '点击绿色的 Code 按钮以查看下载选项。' },
        targetId: 'repo-code'
      },
      {
        id: 'download-choose',
        title: { en: 'Choose a download method', zh: '选择下载方式' },
        detail: { en: 'Select either Download ZIP or copy the Clone URL.', zh: '选择 Download ZIP 或复制 Clone 链接。' },
        targetId: 'repo-code-dropdown'
      }
    ]
  },
  {
    id: 'create-repository',
    slug: 'create-repository',
    order: 3,
    duration: 10,
    title: { en: 'Step 3: Create a Repository', zh: '第 3 课：创建仓库' },
    summary: { en: 'Create your very first empty repository.', zh: '创建你的第一个空仓库用于存放代码。' },
    goals: [
      { en: 'Fill in repository name', zh: '填写仓库名称' },
      { en: 'Add a description', zh: '添加描述' },
      { en: 'Select visibility', zh: '选择可见性' },
      { en: 'Submit creation', zh: '提交创建' }
    ],
    completionMode: 'all',
    steps: [
      {
        id: 'create-name',
        title: { en: 'Name your repository', zh: '为仓库命名' },
        detail: { en: 'Type a name in the Repository name field.', zh: '在仓库名称栏输入一个名字。' },
        targetId: 'create-name'
      },
      {
        id: 'create-description',
        title: { en: 'Add a description', zh: '添加描述' },
        detail: { en: 'Briefly describe what this repository will be used for.', zh: '简短描述一下这个仓库的用途。' },
        targetId: 'create-description'
      },
      {
        id: 'create-visibility',
        title: { en: 'Choose visibility', zh: '选择可见性' },
        detail: { en: 'Make your repository Public or Private.', zh: '选择将你的仓库设为公开(Public)或私有(Private)。' },
        targetId: 'create-visibility'
      },
      {
        id: 'create-submit',
        title: { en: 'Create repository', zh: '创建仓库' },
        detail: { en: 'Click the Create repository button to finish.', zh: '点击下方的 Create repository 按钮完成创建。' },
        targetId: 'create-submit'
      }
    ]
  }
]

export const courseMap = courses.reduce((acc, c) => {
  acc[c.id] = c
  return acc
}, {} as Record<CourseId, CourseConfig>)
