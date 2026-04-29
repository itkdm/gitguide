import re

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const HomePage = ({')
end_idx = content.find('const LearnPage = ({')

new_homepage = """const HomePage = ({
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
"""

new_content = content[:start_idx] + new_homepage + '\n' + content[end_idx:]
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
