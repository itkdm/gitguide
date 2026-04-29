import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TerminalSquare, 
  Globe2, 
  ChevronRight,
  Clock,
  LayoutTemplate
} from 'lucide-react'
import { 
  CheckCircleIcon, 
  PlayIcon, 
  ChartBarIcon, 
  MapIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid'
import { brand, courses, t } from './content'
import { createInitialProgress, loadProgress, saveProgress } from './progress'
import type {
  BranchKey,
  CourseConfig,
  CourseId,
  CourseProgress,
  CourseStatus,
  LanguageCode,
  LocalizedText,
  ProgressState
} from './types'

type AppHeaderProps = {
  language: LanguageCode
  onLanguageToggle: () => void
}

type LayoutProps = AppHeaderProps & {
  children: React.ReactNode
}

type CourseShellProps = {
  course: CourseConfig
  progress: CourseProgress
  language: LanguageCode
  onTargetInteract: (targetId: string) => void
  onBranchSelect: (branch: BranchKey) => void
  onCreateFormChange: (field: 'name' | 'description' | 'visibility', value: string) => void
  createForm: {
    name: string
    description: string
    visibility: 'public' | 'private' | ''
  }
}

type GlossaryEntry = {
  term: LocalizedText
  description: LocalizedText
}

const uiText = {
  homeTagline: {
    en: 'Bilingual GitHub Learning Lab',
    zh: '双语 GitHub 学习实验室'
  },
  homeTitle: {
    en: 'Your first GitHub lesson starts with one safe click.',
    zh: '给 GitHub 新手的第一步，从一次安全的点击开始。'
  },
  homeBody: {
    en: 'Practice on simulated GitHub pages, learn what each area means, and complete beginner tasks without worrying about breaking anything.',
    zh: '在模拟 GitHub 页面里完成练习，认识每个区域的作用，用低压力的方式学会基础操作。'
  },
  homeAsideTitle: {
    en: 'What you will do here',
    zh: '你会在这里完成什么'
  },
  homeAsideBody: {
    en: 'Browse a repository page, learn how to get the code, and practice creating your first repository through guided tasks.',
    zh: '通过引导任务，完成仓库浏览、下载代码、创建仓库这几个最常见的新手操作。'
  },
  pathTitle: {
    en: 'Learning Path',
    zh: '学习路径'
  },
  pathBody: {
    en: 'Move from reading the page, to getting the code, to creating your own repository.',
    zh: '从看懂仓库页面开始，到学会获取代码，再到创建自己的仓库。'
  },
  courseSimulationLabel: {
    en: 'Interactive Simulation',
    zh: '交互模拟场景'
  },
  glossaryTitle: {
    en: 'Key Terms',
    zh: '关键术语'
  },
  glossaryBody: {
    en: 'These are the words that matter in this lesson and in real GitHub.',
    zh: '这些术语既会出现在本课里，也会出现在真实 GitHub 里。'
  },
  disclaimer: {
    en: 'This is a GitGuide teaching simulation, not an official GitHub page.',
    zh: '本页面是 GitGuide 的教学模拟页面，并非 GitHub 官方页面。'
  }
}

const glossaryByCourse: Record<CourseId, GlossaryEntry[]> = {
  'repository-basics': [
    {
      term: { en: 'Repository', zh: '仓库' },
      description: {
        en: 'A place where code, files, and project history live.',
        zh: '存放代码、文件和项目历史的地方。'
      }
    },
    {
      term: { en: 'README', zh: '项目说明' },
      description: {
        en: 'The main introduction to a project and how to use it.',
        zh: '介绍项目内容和使用方法的主要文档。'
      }
    }
  ],
  'download-code': [
    {
      term: { en: 'Download ZIP', zh: '下载 ZIP' },
      description: {
        en: 'A simple way to download project files without using Git.',
        zh: '不使用 Git，直接下载项目文件的一种简单方式。'
      }
    },
    {
      term: { en: 'Clone', zh: '克隆' },
      description: {
        en: 'Copy a remote repository to your local computer with Git.',
        zh: '使用 Git 把远程仓库复制到本地电脑。'
      }
    }
  ],
  'create-repository': [
    {
      term: { en: 'Public', zh: '公开' },
      description: {
        en: 'Anyone can see the repository.',
        zh: '任何人都可以看到这个仓库。'
      }
    },
    {
      term: { en: 'Private', zh: '私有' },
      description: {
        en: 'Only approved people can see the repository.',
        zh: '只有被允许的人才能看到这个仓库。'
      }
    }
  ]
}

const statusLabel = (status: CourseStatus, language: LanguageCode) => {
  const map: Record<CourseStatus, LocalizedText> = {
    not_started: { en: 'Not Started', zh: '未开始' },
    in_progress: { en: 'In Progress', zh: '进行中' },
    completed: { en: 'Completed', zh: '已完成' }
  }
  return t(map[status], language)
}

const AppHeader = ({ language, onLanguageToggle }: AppHeaderProps) => {
  const navigate = useNavigate()
  return (
  <motion.header 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="app-header"
  >
    <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="logo-box">
        <TerminalSquare size={24} />
      </div>
      <div>
        <h1 style={{ margin: 0, color: 'var(--ink)' }}>{language === 'en' ? brand.en : brand.zh}</h1>
      </div>
    </div>
    <button className="language-toggle" onClick={onLanguageToggle} aria-label="Switch language">
      <Globe2 size={16} />
      <span className={language === 'zh' ? 'active' : ''}>中</span>
      <span className="divider">/</span>
      <span className={language === 'en' ? 'active' : ''}>En</span>
    </button>
  </motion.header>
  )
}

const PageLayout = ({ children, language, onLanguageToggle }: LayoutProps) => (
  <div className="page-shell">
    <AppHeader language={language} onLanguageToggle={onLanguageToggle} />
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {children}
    </motion.main>
  </div>
)

const LessonHero = ({
  course,
  progress,
  language
}: {
  course: CourseConfig
  progress: CourseProgress
  language: LanguageCode
}) => {
  const completed = progress.completedStepIds.length
  const total = course.steps.length

  return (
    <section className="lesson-hero">
      <div className="lesson-marker">
        <span>{String(course.order).padStart(2, '0')}</span>
      </div>
      <div className="lesson-hero-copy">
        <div className="eyebrow">
          {language === 'en' ? `Lesson ${course.order}` : `第 ${course.order} 课`}
        </div>
        <h2>{t(course.title, language)}</h2>
        <p>{t(course.summary, language)}</p>
      </div>
      <div className="lesson-hero-side">
        <span className="chip">{statusLabel(progress.status, language)}</span>
        <strong>
          {language === 'en'
            ? `${completed} / ${total} steps complete`
            : `已完成 ${completed} / ${total} 步`}
        </strong>
      </div>
    </section>
  )
}

const GuideRibbon = ({
  title,
  body,
  language
}: {
  title: string
  body: string
  language: LanguageCode
}) => (
  <div className="guide-ribbon">
    <span className="eyebrow">{language === 'en' ? 'Guide' : '引导'}</span>
    <strong>{title}</strong>
    <p>{body}</p>
  </div>
)

const RepoUtilityBar = ({ language }: { language: LanguageCode }) => (
  <div className="repo-utility-bar">
    <div className="repo-badges">
      <span className="repo-badge">Public</span>
      <span className="repo-badge muted">
        {language === 'en' ? 'template available' : '可用模板'}
      </span>
    </div>
    <div className="repo-actions">
      <button className="repo-mini-button">Notifications</button>
      <button className="repo-mini-button">Fork 128</button>
      <button className="repo-mini-button">Star 4.8k</button>
    </div>
  </div>
)

const RepoFileTable = ({
  language,
  activeTarget,
  onTargetInteract
}: {
  language: LanguageCode
  activeTarget?: string
  onTargetInteract: (id: string) => void
}) => (
  <div
    className={`repo-files ${activeTarget === 'repo-files' ? 'active-target' : ''}`}
    onClick={() => onTargetInteract('repo-files')}
  >
    <div className="files-toolbar">
      <div className="branch-pill">main</div>
      <div className="files-summary">
        {language === 'en' ? '12 commits · 7 files' : '12 次提交 · 7 个文件'}
      </div>
    </div>
    <div className="file-row"><strong>docs</strong><span>{language === 'en' ? 'product notes and lesson planning' : '产品文档与课程规划'}</span></div>
    <div className="file-row"><strong>src</strong><span>{language === 'en' ? 'application source code' : '应用源代码'}</span></div>
    <div className="file-row"><strong>README.md</strong><span>{language === 'en' ? 'project overview and usage' : '项目概览与使用说明'}</span></div>
    <div className="file-row"><strong>package.json</strong><span>{language === 'en' ? 'dependencies and scripts' : '依赖与脚本配置'}</span></div>
  </div>
)

const HomePage = ({
  progress,
  language,
  onLanguageToggle
}: {
  progress: ProgressState
  language: LanguageCode
  onLanguageToggle: () => void
}) => {
  const navigate = useNavigate()
  const completedCount = Object.values(progress.courses).filter(
    (course) => course.status === 'completed'
  ).length
  const hasActivity = Object.values(progress.courses).some(
    (course) => course.status !== 'not_started'
  )

  const primaryLabel =
    completedCount === courses.length
      ? language === 'en'
        ? 'Review Progress'
        : '查看学习进度'
      : hasActivity
        ? language === 'en'
          ? 'Continue'
          : '继续学习'
        : language === 'en'
          ? 'Start Learning'
          : '开始学习'

  const nextCourse = courses.find((course) => progress.courses[course.id].status !== 'completed') ?? courses[0]

  const primaryAction = () => {
    if (completedCount === courses.length) {
      navigate('/progress')
      return
    }
    navigate(`/learn/${hasActivity && progress.lastVisitedCourseId ? progress.lastVisitedCourseId : nextCourse.slug}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <PageLayout language={language} onLanguageToggle={onLanguageToggle}>
      
      {/* 现代拆分式 Hero 大图区 */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="modern-hero"
      >
        <div className="hero-content">
          <motion.div variants={itemVariants} className="cyber-badge">
            <TerminalSquare size={16} />
            {t(uiText.homeTagline, language)}
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="cyber-title">
            {language === 'en' ? 'Start your first' : '给新手的'} <br/>
            <span className="accent-text">GitHub</span> {language === 'en' ? 'lesson.' : '第一步'}
          </motion.h2>
          
          <motion.p variants={itemVariants} className="cyber-desc">
            {language === 'en' 
              ? 'Practice repository operations in a secure, simulated environment without worrying about breaking anything.'
              : '在逼真的模拟 GitHub 环境里完成练习，认识每个区域的作用，用没有压力的方式学会基础操作。'}
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-actions-left">
            <button className="primary-button hero-cta" onClick={primaryAction}>
              {primaryLabel}
              <ChevronRight size={20} />
            </button>
            <button className="secondary-button hero-cta" onClick={() => navigate('/progress')}>
              <ChartBarIcon style={{ width: '20px', height: '20px' }} />
              {language === 'en' ? 'View Progress' : '查看进度'}
            </button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="hero-visual">
          <div className="mock-window">
            <div className="mock-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mock-body">
              <div className="mock-line"><span className="text-muted">$</span> git init</div>
              <div className="mock-line"><span className="text-muted">$</span> git add .</div>
              <div className="mock-line"><span className="text-muted">$</span> git commit -m "first commit"</div>
              <div className="mock-line"><span className="text-muted">$</span> git branch -M main</div>
              <div className="mock-line"><span className="text-muted">$</span> git push -u origin main</div>
              <div className="mock-line cursor-blink">_</div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* 核心特性横幅区 */}
      <section className="features-section">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-wrapper"><Globe2 size={24}/></div>
            <h3>{language === 'en' ? 'Safe Environment' : '安全沙盒环境'}</h3>
            <p>{language === 'en' ? 'No real repositories will be affected. Make mistakes safely.' : '在这里随便点随便删，没有任何操作会影响你真实的 GitHub 账户。'}</p>
          </div>
          <div className="feature-card">
            <div className="icon-wrapper"><TerminalSquare size={24}/></div>
            <h3>{language === 'en' ? 'Interactive Learning' : '交互式学习'}</h3>
            <p>{language === 'en' ? 'Learn muscle memory in a realistic GitHub UI clone.' : '通过 1:1 还原界面，抛弃枯燥文档，直接上手点，培养肌肉记忆。'}</p>
          </div>
          <div className="feature-card">
            <div className="icon-wrapper"><MapIcon style={{width: 24, height: 24}}/></div>
            <h3>{language === 'en' ? 'Guided Path' : '路线图引导'}</h3>
            <p>{language === 'en' ? 'Follow step-by-step missions from browsing to creating.' : '像玩游戏一样跟着任务提示，带你从认识仓库一直走向创建仓库。'}</p>
          </div>
        </div>
      </section>

      {/* 学习路径与关卡区 */}
      <section className="path-section">
        <div className="path-header">
          <h2>{language === 'en' ? 'Learning Path' : '学习路径'}</h2>
          <p>{language === 'en' ? 'Master the basics, step by step.' : '循序渐进，轻松通关核心操作。'}</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="course-grid"
        >
          {courses.map((course, idx) => (
            <motion.article 
              key={course.id} 
              className="cyber-card course-path-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              onClick={() => navigate(`/learn/${course.slug}`)}
            >
              <div className="preview-header">
                <span className={`status-badge ${progress.courses[course.id].status}`}>
                  {statusLabel(progress.courses[course.id].status, language)}
                </span>
                <span className="duration-badge"><Clock size={14}/>{course.duration}m</span>
              </div>
              <h3 className="course-title">{t(course.title, language)}</h3>
              <p className="course-desc">{t(course.summary, language)}</p>
              
              <div className="card-footer">
                <span className="enter-link">
                  {language === 'en' ? 'Start Mission' : '进入任务'}
                  <ChevronRight size={16} />
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

    </PageLayout>
  )
}

const LearnPage = ({
  progress,
  language,
  onLanguageToggle
}: {
  progress: ProgressState
  language: LanguageCode
  onLanguageToggle: () => void
}) => {
  const navigate = useNavigate()

  return (
    <PageLayout language={language} onLanguageToggle={onLanguageToggle}>
      <section className="panel panel-lifted">
        <h2>{t(uiText.pathTitle, language)}</h2>
        <p>{t(uiText.pathBody, language)}</p>
      </section>

      <section className="grid">
        {courses.map((course) => {
          const courseProgress = progress.courses[course.id]
          return (
            <article className="course-card" key={course.id}>
              <div className="course-card-top">
                <span className="eyebrow">
                  {language === 'en' ? `Lesson ${course.order}` : `第 ${course.order} 课`}
                </span>
                <span className="chip">{statusLabel(courseProgress.status, language)}</span>
              </div>
              <h3>{t(course.title, language)}</h3>
              <p>{t(course.summary, language)}</p>
              <ul className="goal-list">
                {course.goals.map((goal, index) => (
                  <li key={`${course.id}-${index}`}>{t(goal, language)}</li>
                ))}
              </ul>
              <div className="course-card-footer">
                <span>{language === 'en' ? `${course.duration} min` : `约 ${course.duration} 分钟`}</span>
                <button className="primary-button" onClick={() => navigate(`/learn/${course.slug}`)}>
                  {courseProgress.status === 'not_started'
                    ? language === 'en'
                      ? 'Start Lesson'
                      : '开始课程'
                    : language === 'en'
                      ? 'Continue Lesson'
                      : '继续课程'}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </PageLayout>
  )
}

const RepositoryScene = ({
  onTargetInteract,
  activeTarget,
  language
}: {
  onTargetInteract: (id: string) => void
  activeTarget?: string
  language: LanguageCode
}) => (
  <div className="simulation-frame">
    <GuideRibbon
      title={language === 'en' ? 'Look around the page structure' : '先观察页面结构'}
      body={
        language === 'en'
          ? 'This lesson helps you recognize the main areas of a repository page.'
          : '这节课会帮助你认识仓库页面中的几个主要区域。'
      }
      language={language}
    />
    <div
      className={`repo-title ${activeTarget === 'repo-title' ? 'active-target' : ''}`}
      onClick={() => onTargetInteract('repo-title')}
    >
      <span className="repo-owner">openai /</span> gitguide-demo
    </div>
    <RepoUtilityBar language={language} />
    <div
      className={`repo-nav ${activeTarget === 'repo-nav' ? 'active-target' : ''}`}
      onClick={() => onTargetInteract('repo-nav')}
    >
      <span>Code</span>
      <span>Issues</span>
      <span>Pull Requests</span>
      <span>Actions</span>
      <span>Projects</span>
    </div>
    <div className="repo-scene-grid">
      <div className="repo-main-column">
        <div className="repo-top-row">
          <RepoFileTable
            language={language}
            activeTarget={activeTarget}
            onTargetInteract={onTargetInteract}
          />
          <button
            className={`code-button ${activeTarget === 'repo-code' ? 'active-target' : ''}`}
            onClick={() => onTargetInteract('repo-code')}
          >
            Code
          </button>
        </div>
        <div
          className={`repo-readme ${activeTarget === 'repo-readme' ? 'active-target' : ''}`}
          onClick={() => onTargetInteract('repo-readme')}
        >
          <div className="readme-header">
            <strong>README</strong>
            <span>{language === 'en' ? 'Preview' : '预览'}</span>
          </div>
          <h4>{language === 'en' ? 'GitGuide Demo Repository' : 'GitGuide 示例仓库'}</h4>
          <p>
            {language === 'en'
              ? 'This is where a project usually explains what it is, how to install it, and how to use it.'
              : '这里通常会介绍项目是做什么的、如何安装，以及该如何使用。'}
          </p>
          <ul className="readme-points">
            <li>{language === 'en' ? 'Project purpose' : '项目用途'}</li>
            <li>{language === 'en' ? 'Installation steps' : '安装步骤'}</li>
            <li>{language === 'en' ? 'Usage examples' : '使用示例'}</li>
          </ul>
        </div>
      </div>
      <aside className="repo-side-column">
        <div className="about-card">
          <strong>{language === 'en' ? 'About' : '关于'}</strong>
          <p>
            {language === 'en'
              ? 'A guided beginner-friendly GitHub learning project.'
              : '一个面向新手的 GitHub 引导式学习项目。'}
          </p>
          <div className="about-meta">
            <span>README</span>
            <span>tutorial</span>
            <span>bilingual</span>
          </div>
        </div>
      </aside>
    </div>
    <p className="scene-note">{t(uiText.disclaimer, language)}</p>
  </div>
)

const DownloadScene = ({
  onTargetInteract,
  onBranchSelect,
  codeMenuOpen,
  activeTarget,
  language
}: {
  onTargetInteract: (id: string) => void
  onBranchSelect: (branch: BranchKey) => void
  codeMenuOpen: boolean
  activeTarget?: string
  language: LanguageCode
}) => (
  <div className="simulation-frame">
    <GuideRibbon
      title={language === 'en' ? 'Open Code to see your options' : '打开 Code 查看可选方式'}
      body={
        language === 'en'
          ? 'After opening the menu, you can decide how you want to get the code.'
          : '展开菜单后，你可以自主决定用哪种方式获取代码。'
      }
      language={language}
    />
    <div className="repo-title"><span className="repo-owner">openai /</span> gitguide-demo</div>
    <RepoUtilityBar language={language} />
    <div className="repo-nav">
      <span>Code</span>
      <span>Issues</span>
      <span>Pull Requests</span>
      <span>Actions</span>
    </div>
    <div className="repo-scene-grid">
      <div className="repo-main-column">
        <div className="repo-top-row">
          <RepoFileTable
            language={language}
            activeTarget={undefined}
            onTargetInteract={onTargetInteract}
          />
          <div className="code-menu-wrapper">
            <button
              className={`code-button ${activeTarget === 'repo-code' ? 'active-target' : ''}`}
              onClick={() => onTargetInteract('repo-code')}
            >
              Code
            </button>
            {codeMenuOpen ? (
              <div className="code-menu animated-pop">
                <div className="code-menu-header">
                  <strong>{language === 'en' ? 'Local' : '本地获取'}</strong>
                  <span>HTTPS</span>
                </div>
                <div className="clone-url">
                  https://github.com/openai/gitguide-demo.git
                </div>
                <button className="menu-action" onClick={() => onBranchSelect('clone')}>
                  {language === 'en' ? 'Copy Clone URL' : '复制 Clone 地址'}
                </button>
                <button className="menu-action signal" onClick={() => onBranchSelect('zip')}>
                  Download ZIP
                </button>
                <p className="menu-note">
                  {language === 'en'
                    ? 'Choose the method that fits your workflow.'
                    : '选择更适合你的获取代码方式。'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="repo-readme compact-readme">
          <strong>README</strong>
          <p>
            {language === 'en'
              ? 'After you understand the menu, you can decide whether to quickly download files or use Git to clone the repository.'
              : '看懂这个菜单后，你就能判断是快速下载文件，还是使用 Git 克隆仓库。'}
          </p>
        </div>
      </div>
      <aside className="repo-side-column">
        <div className="about-card">
          <strong>{language === 'en' ? 'Quick hint' : '快速提示'}</strong>
          <p>
            {language === 'en'
              ? 'ZIP is easier for pure beginners. Clone is better when you are ready to use Git locally.'
              : '对纯新手来说 ZIP 更容易；当你开始本地使用 Git 时，Clone 会更合适。'}
          </p>
        </div>
      </aside>
    </div>
    <p className="scene-note">{t(uiText.disclaimer, language)}</p>
  </div>
)

const CreateRepositoryScene = ({
  createForm,
  activeTarget,
  onCreateFormChange,
  onTargetInteract,
  language
}: {
  createForm: { name: string; description: string; visibility: 'public' | 'private' | '' }
  activeTarget?: string
  onCreateFormChange: (field: 'name' | 'description' | 'visibility', value: string) => void
  onTargetInteract: (targetId: string) => void
  language: LanguageCode
}) => (
  <div className="simulation-frame create-scene">
    <GuideRibbon
      title={language === 'en' ? 'Fill the key fields first' : '先填写几个核心字段'}
      body={
        language === 'en'
          ? 'Repository name and visibility are the most important fields in this lesson.'
          : '本节课里最重要的是仓库名称和可见性。'
      }
      language={language}
    />
    <div className="create-header">
      <h3>{language === 'en' ? 'Create a new repository' : '创建新仓库'}</h3>
      <span>{language === 'en' ? 'Owner: your-account' : '所有者：your-account'}</span>
    </div>
    <label className={`form-card ${activeTarget === 'create-name' ? 'active-target' : ''}`}>
      <span>{language === 'en' ? 'Repository name' : '仓库名称'}</span>
      <input
        value={createForm.name}
        onFocus={() => onTargetInteract('create-name')}
        onChange={(event) => onCreateFormChange('name', event.target.value)}
        placeholder="my-first-project"
      />
    </label>
    <label className={`form-card ${activeTarget === 'create-description' ? 'active-target' : ''}`}>
      <span>{language === 'en' ? 'Description' : '仓库描述'}</span>
      <textarea
        value={createForm.description}
        onFocus={() => onTargetInteract('create-description')}
        onChange={(event) => onCreateFormChange('description', event.target.value)}
        placeholder={
          language === 'en'
            ? 'Short project description'
            : '简单描述一下这个项目'
        }
      />
    </label>
    <div className={`form-card ${activeTarget === 'create-visibility' ? 'active-target' : ''}`}>
      <span>{language === 'en' ? 'Visibility' : '可见性'}</span>
      <div className="radio-row">
        <button
          onClick={() => {
            onTargetInteract('create-visibility')
            onCreateFormChange('visibility', 'public')
          }}
          className={createForm.visibility === 'public' ? 'radio-pill selected' : 'radio-pill'}
        >
          Public
        </button>
        <button
          onClick={() => {
            onTargetInteract('create-visibility')
            onCreateFormChange('visibility', 'private')
          }}
          className={createForm.visibility === 'private' ? 'radio-pill selected' : 'radio-pill'}
        >
          Private
        </button>
      </div>
    </div>
    <div className="form-card options-card">
      <span>{language === 'en' ? 'Initialize this repository with' : '初始化仓库时附带'}</span>
      <div className="option-line">
        <input type="checkbox" checked readOnly />
        <label>{language === 'en' ? 'Add a README file' : '添加 README 文件'}</label>
      </div>
      <div className="option-line">
        <input type="checkbox" readOnly />
        <label>{language === 'en' ? 'Add .gitignore' : '添加 .gitignore'}</label>
      </div>
      <div className="option-line">
        <input type="checkbox" readOnly />
        <label>{language === 'en' ? 'Choose a license' : '选择许可证'}</label>
      </div>
    </div>
    <div className="form-card subtle-card">
      <span>{language === 'en' ? 'Initialize with a README (optional)' : '初始化 README（可选）'}</span>
      <small>
        {language === 'en'
          ? 'Helpful in real projects, but not required in the main lesson.'
          : '在真实项目里通常有帮助，但不是本课主线必做步骤。'}
      </small>
    </div>
    <button
      className={`primary-button wide ${activeTarget === 'create-submit' ? 'active-target' : ''}`}
      onClick={() => onTargetInteract('create-submit')}
    >
      {language === 'en' ? 'Create repository' : '创建仓库'}
    </button>
    <p className="scene-note">{t(uiText.disclaimer, language)}</p>
  </div>
)

const TaskPanel = ({
  course,
  progress,
  language,
  branchMessage
}: {
  course: CourseConfig
  progress: CourseProgress
  language: LanguageCode
  branchMessage?: string
}) => {
  const activeStep =
    course.steps.find((step) => step.id === progress.activeStepId) ?? course.steps[0]
  const currentIndex = course.steps.findIndex((step) => step.id === activeStep?.id)
  const stepText =
    currentIndex >= 0
      ? language === 'en'
        ? `Step ${currentIndex + 1} of ${course.steps.length}`
        : `第 ${currentIndex + 1} 步，共 ${course.steps.length} 步`
      : ''

  return (
    <aside className="task-panel">
      <div className="task-panel-head">
        <span className="eyebrow">{language === 'en' ? 'Mission Control' : '任务面板'}</span>
        <span className="chip">{statusLabel(progress.status, language)}</span>
      </div>
      <h3>{t(course.title, language)}</h3>
      <p className="step-count">{stepText}</p>
      <div className="task-box">
        <h4>
          {activeStep
            ? t(activeStep.title, language)
            : language === 'en'
              ? 'Complete the lesson'
              : '完成课程'}
        </h4>
        <p>{activeStep ? t(activeStep.detail, language) : ''}</p>
      </div>
      {branchMessage ? <p className="branch-note">{branchMessage}</p> : null}
      <div className="progress-mini">
        {course.steps.map((step) => (
          <span
            key={step.id}
            className={
              progress.completedStepIds.includes(step.id)
                ? 'progress-dot done'
                : progress.activeStepId === step.id
                  ? 'progress-dot active'
                  : 'progress-dot'
            }
          />
        ))}
      </div>
      <div className="glossary-box">
        <h4>{t(uiText.glossaryTitle, language)}</h4>
        <p>{t(uiText.glossaryBody, language)}</p>
        <div className="glossary-list">
          {glossaryByCourse[course.id].map((entry) => (
            <article className="glossary-item" key={entry.term.en}>
              <strong>{t(entry.term, language)}</strong>
              <span>{t(entry.description, language)}</span>
            </article>
          ))}
        </div>
      </div>
    </aside>
  )
}

const CourseShell = ({
  course,
  progress,
  language,
  onTargetInteract,
  onBranchSelect,
  onCreateFormChange,
  createForm
}: CourseShellProps) => {
  const activeStep =
    course.steps.find((step) => step.id === progress.activeStepId) ?? course.steps[0]
  const activeTarget = activeStep?.targetId

  let branchMessage = ''
  if (course.id === 'download-code') {
    const completedBranches = progress.completedBranches ?? []
    branchMessage =
      completedBranches.length === 0
        ? language === 'en'
          ? 'Click Code, then choose ZIP or Clone.'
          : '先点击 Code，再选择 ZIP 或 Clone。'
        : completedBranches.length === 1
          ? language === 'en'
            ? `Great. You completed the ${completedBranches[0]} path. You can still try the other one.`
            : `很好，你已经完成了 ${completedBranches[0] === 'zip' ? 'ZIP' : 'Clone'} 路径，也可以继续尝试另一条。`
          : language === 'en'
            ? 'You completed both download paths.'
            : '你已经完成了两条下载路径。'
  }

  return (
    <>
      <LessonHero course={course} progress={progress} language={language} />
      <div className="course-layout">
        <div>
          <div className="scene-label">{t(uiText.courseSimulationLabel, language)}</div>
          {course.id === 'repository-basics' ? (
            <RepositoryScene
              onTargetInteract={onTargetInteract}
              activeTarget={activeTarget}
              language={language}
            />
          ) : null}
          {course.id === 'download-code' ? (
            <DownloadScene
              onTargetInteract={onTargetInteract}
              onBranchSelect={onBranchSelect}
              codeMenuOpen={
                (progress.completedStepIds.includes('download-open-code') ||
                  progress.activeStepId === 'download-choose') &&
                progress.status !== 'completed'
              }
              activeTarget={activeTarget}
              language={language}
            />
          ) : null}
          {course.id === 'create-repository' ? (
            <CreateRepositoryScene
              createForm={createForm}
              activeTarget={activeTarget}
              onCreateFormChange={onCreateFormChange}
              onTargetInteract={onTargetInteract}
              language={language}
            />
          ) : null}
        </div>
        <TaskPanel
          course={course}
          progress={progress}
          language={language}
          branchMessage={branchMessage}
        />
      </div>
    </>
  )
}

const CoursePage = ({
  progress,
  setProgress,
  language,
  onLanguageToggle
}: {
  progress: ProgressState
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>
  language: LanguageCode
  onLanguageToggle: () => void
}) => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = courses.find((item) => item.slug === slug)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    visibility: '' as 'public' | 'private' | ''
  })

  if (!course) {
    return <Navigate to="/learn" replace />
  }

  const courseProgress = progress.courses[course.id]

  const patchCourseProgress = (updater: (current: CourseProgress) => CourseProgress) => {
    setProgress((current) => {
      const nextCourse = updater(current.courses[course.id])
      return {
        ...current,
        lastVisitedCourseId: course.id,
        lastVisitedStepId: nextCourse.activeStepId,
        courses: {
          ...current.courses,
          [course.id]: nextCourse
        }
      }
    })
  }

  const completeCourse = (nextProgress: CourseProgress) => {
    patchCourseProgress(() => ({
      ...nextProgress,
      status: 'completed',
      completedAt: new Date().toISOString()
    }))
    navigate(`/learn/${course.slug}/complete`)
  }

  const advanceLinearStep = (targetId: string) => {
    const stepIndex = course.steps.findIndex((step) => step.id === courseProgress.activeStepId)
    const activeStep = course.steps[stepIndex]
    if (!activeStep || activeStep.targetId !== targetId) {
      return
    }

    const nextStep = course.steps[stepIndex + 1]
    const completedStepIds = Array.from(new Set([...courseProgress.completedStepIds, activeStep.id]))
    const nextState: CourseProgress = {
      ...courseProgress,
      status: 'in_progress',
      startedAt: courseProgress.startedAt ?? new Date().toISOString(),
      completedStepIds,
      activeStepId: nextStep?.id ?? activeStep.id
    }

    if (!nextStep) {
      completeCourse(nextState)
      return
    }

    patchCourseProgress(() => nextState)
  }

  const onTargetInteract = (targetId: string) => {
    if (course.id === 'repository-basics') {
      advanceLinearStep(targetId)
      return
    }

    if (course.id === 'download-code') {
      if (courseProgress.activeStepId === 'download-open-code' && targetId === 'repo-code') {
        patchCourseProgress(() => ({
          ...courseProgress,
          status: 'in_progress',
          startedAt: courseProgress.startedAt ?? new Date().toISOString(),
          completedStepIds: Array.from(
            new Set([...courseProgress.completedStepIds, 'download-open-code'])
          ),
          activeStepId: 'download-choose'
        }))
      }
      return
    }

    if (course.id === 'create-repository') {
      if (targetId === 'create-submit') {
        if (!createForm.name || !createForm.visibility) {
          return
        }

        const completed = Array.from(
          new Set([...course.steps.map((step) => step.id), ...courseProgress.completedStepIds])
        )
        completeCourse({
          ...courseProgress,
          status: 'in_progress',
          startedAt: courseProgress.startedAt ?? new Date().toISOString(),
          completedStepIds: completed,
          activeStepId: 'create-submit'
        })
        return
      }

      advanceLinearStep(targetId)
    }
  }

  const onBranchSelect = (branch: BranchKey) => {
    if (course.id !== 'download-code' || courseProgress.activeStepId !== 'download-choose') {
      return
    }

    const completedBranches = Array.from(
      new Set([...(courseProgress.completedBranches ?? []), branch])
    )

    completeCourse({
      ...courseProgress,
      status: 'in_progress',
      selectedBranch: branch,
      completedBranches,
      startedAt: courseProgress.startedAt ?? new Date().toISOString(),
      completedStepIds: Array.from(
        new Set([...courseProgress.completedStepIds, 'download-choose'])
      ),
      activeStepId: 'download-choose'
    })
  }

  const onCreateFormChange = (
    field: 'name' | 'description' | 'visibility',
    value: string
  ) => {
    setCreateForm((current) => ({ ...current, [field]: value }))

    if (course.id !== 'create-repository') {
      return
    }

    const currentStepId = progress.courses[course.id].activeStepId

    if (field === 'name' && currentStepId === 'create-name' && value.trim()) {
      patchCourseProgress(() => ({
        ...courseProgress,
        status: 'in_progress',
        startedAt: courseProgress.startedAt ?? new Date().toISOString(),
        completedStepIds: Array.from(
          new Set([...courseProgress.completedStepIds, 'create-name'])
        ),
        activeStepId: 'create-description'
      }))
      return
    }

    if (
      field === 'description' &&
      currentStepId === 'create-description' &&
      value.trim()
    ) {
      patchCourseProgress(() => ({
        ...courseProgress,
        status: 'in_progress',
        completedStepIds: Array.from(
          new Set([...courseProgress.completedStepIds, 'create-description'])
        ),
        activeStepId: 'create-visibility'
      }))
      return
    }

    if (
      field === 'visibility' &&
      currentStepId === 'create-visibility' &&
      value
    ) {
      patchCourseProgress(() => ({
        ...courseProgress,
        status: 'in_progress',
        completedStepIds: Array.from(
          new Set([...courseProgress.completedStepIds, 'create-visibility'])
        ),
        activeStepId: 'create-submit'
      }))
    }
  }

  return (
    <PageLayout language={language} onLanguageToggle={onLanguageToggle}>
      <div className="page-tools">
        <button className="ghost-link" onClick={() => navigate('/learn')}>
          {language === 'en' ? 'Back to Learning Path' : '返回学习路径'}
        </button>
        <button className="ghost-link" onClick={() => navigate('/progress')}>
          {language === 'en' ? 'View Progress' : '查看进度'}
        </button>
      </div>
      <CourseShell
        course={course}
        progress={courseProgress}
        language={language}
        onTargetInteract={onTargetInteract}
        onBranchSelect={onBranchSelect}
        onCreateFormChange={onCreateFormChange}
        createForm={createForm}
      />
    </PageLayout>
  )
}

const CompletePage = ({
  progress,
  language,
  onLanguageToggle
}: {
  progress: ProgressState
  language: LanguageCode
  onLanguageToggle: () => void
}) => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = courses.find((item) => item.slug === slug)

  if (!course) {
    return <Navigate to="/learn" replace />
  }

  const nextCourse = courses.find((item) => item.order === course.order + 1)
  const courseProgress = progress.courses[course.id]
  const completedBranches = courseProgress.completedBranches ?? []

  return (
    <PageLayout language={language} onLanguageToggle={onLanguageToggle}>
      <section className="completion-card">
        <span className="chip success">
          {language === 'en' ? 'Lesson Complete' : '课程完成'}
        </span>
        <h2>{t(course.title, language)}</h2>
        <p>
          {language === 'en'
            ? 'You finished this guided practice lesson.'
            : '你已经完成了这节引导练习课。'}
        </p>
        <ul className="goal-list">
          {course.goals.map((goal, index) => (
            <li key={`${course.id}-goal-${index}`}>{t(goal, language)}</li>
          ))}
        </ul>
        {course.id === 'download-code' ? (
          <p className="branch-note">
            {completedBranches.length > 1
              ? language === 'en'
                ? 'You completed both ZIP and Clone paths.'
                : '你已经完成了 ZIP 和 Clone 两条路径。'
              : completedBranches[0] === 'zip'
                ? language === 'en'
                  ? 'You completed the ZIP path. You can revisit the lesson to try Clone.'
                  : '你完成了 ZIP 路径，之后可以重学并尝试 Clone。'
                : language === 'en'
                  ? 'You completed the Clone path. You can revisit the lesson to try ZIP.'
                  : '你完成了 Clone 路径，之后可以重学并尝试 ZIP。'}
          </p>
        ) : null}
        <div className="hero-actions">
          {nextCourse ? (
            <button
              className="primary-button"
              onClick={() => navigate(`/learn/${nextCourse.slug}`)}
            >
              {language === 'en' ? 'Go to Next Lesson' : '进入下一课'}
            </button>
          ) : (
            <button className="primary-button" onClick={() => navigate('/progress')}>
              {language === 'en' ? 'View Progress' : '查看进度'}
            </button>
          )}
          <button className="secondary-button" onClick={() => navigate('/learn')}>
            {language === 'en' ? 'Back to Learning Path' : '返回学习路径'}
          </button>
        </div>
      </section>
    </PageLayout>
  )
}

const ProgressPage = ({
  progress,
  setProgress,
  language,
  onLanguageToggle
}: {
  progress: ProgressState
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>
  language: LanguageCode
  onLanguageToggle: () => void
}) => {
  const navigate = useNavigate()
  const completedCount = Object.values(progress.courses).filter(
    (course) => course.status === 'completed'
  ).length

  const resetCourse = (courseId: CourseId) => {
    const initial = createInitialProgress().courses[courseId]
    setProgress((current) => ({
      ...current,
      courses: {
        ...current.courses,
        [courseId]: initial
      },
      lastVisitedCourseId:
        current.lastVisitedCourseId === courseId ? null : current.lastVisitedCourseId,
      lastVisitedStepId:
        current.lastVisitedCourseId === courseId ? null : current.lastVisitedStepId
    }))
  }

  return (
    <PageLayout language={language} onLanguageToggle={onLanguageToggle}>
      <section className="panel panel-lifted">
        <h2>{language === 'en' ? 'Learning Progress' : '学习进度'}</h2>
        <p>
          {language === 'en'
            ? `You completed ${completedCount} of ${courses.length} lessons.`
            : `你已经完成了 ${completedCount} / ${courses.length} 节课程。`}
        </p>
      </section>

      <section className="grid">
        {courses.map((course) => {
          const courseProgress = progress.courses[course.id]
          return (
            <article className="course-card" key={course.id}>
              <div className="course-card-top">
                <h3>{t(course.title, language)}</h3>
                <span className="chip">{statusLabel(courseProgress.status, language)}</span>
              </div>
              <p>
                {language === 'en'
                  ? `${courseProgress.completedStepIds.length} steps completed`
                  : `已完成 ${courseProgress.completedStepIds.length} 个步骤`}
              </p>
              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => navigate(`/learn/${course.slug}`)}
                >
                  {courseProgress.status === 'completed'
                    ? language === 'en'
                      ? 'Review Lesson'
                      : '回看课程'
                    : language === 'en'
                      ? 'Continue'
                      : '继续学习'}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => resetCourse(course.id)}
                >
                  {language === 'en' ? 'Restart Lesson' : '重学本课'}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </PageLayout>
  )
}

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const language = progress.language

  const onLanguageToggle = () => {
    setProgress((current) => ({
      ...current,
      language: current.language === 'en' ? 'zh' : 'en'
    }))
  }

  const routeProps = useMemo(
    () => ({ progress, setProgress, language, onLanguageToggle }),
    [progress, language]
  )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            progress={progress}
            language={language}
            onLanguageToggle={onLanguageToggle}
          />
        }
      />
      <Route
        path="/learn"
        element={
          <LearnPage
            progress={progress}
            language={language}
            onLanguageToggle={onLanguageToggle}
          />
        }
      />
      <Route path="/learn/:slug" element={<CoursePage {...routeProps} />} />
      <Route
        path="/learn/:slug/complete"
        element={
          <CompletePage
            progress={progress}
            language={language}
            onLanguageToggle={onLanguageToggle}
          />
        }
      />
      <Route path="/progress" element={<ProgressPage {...routeProps} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
