export type LanguageCode = 'en' | 'zh'

export type LocalizedText = {
  en: string
  zh: string
}

export type BranchKey = 'zip' | 'clone'

export type CourseId =
  | 'repository-basics'
  | 'download-code'
  | 'create-repository'

export type CourseStatus = 'not_started' | 'in_progress' | 'completed'

export type CourseStep = {
  id: string
  title: LocalizedText
  detail: LocalizedText
  targetId?: string
}

export type CourseConfig = {
  id: CourseId
  slug: string
  order: number
  duration: number
  title: LocalizedText
  summary: LocalizedText
  goals: LocalizedText[]
  completionMode: 'all' | 'any-branch'
  steps: CourseStep[]
}

export type CourseProgress = {
  status: CourseStatus
  activeStepId: string | null
  completedStepIds: string[]
  selectedBranch?: BranchKey | null
  completedBranches?: BranchKey[]
  startedAt?: string
  completedAt?: string
}

export type ProgressState = {
  language: LanguageCode
  lastVisitedCourseId: CourseId | null
  lastVisitedStepId: string | null
  courses: Record<CourseId, CourseProgress>
}
