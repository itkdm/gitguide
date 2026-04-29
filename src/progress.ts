import { courseMap, courses } from './content'
import type { CourseId, ProgressState } from './types'

const STORAGE_KEY = 'gitguide.progress.v1'

const buildInitialCourseState = (courseId: CourseId) => ({
  status: 'not_started' as const,
  activeStepId: courseMap[courseId].steps[0]?.id ?? null,
  completedStepIds: [],
  selectedBranch: null,
  completedBranches: []
})

export const createInitialProgress = (): ProgressState => {
  const initialCourses = {} as Record<string, ReturnType<typeof buildInitialCourseState>>
  for (const course of courses) {
    initialCourses[course.id] = buildInitialCourseState(course.id)
  }
  return {
    language: 'en',
    lastVisitedCourseId: null,
    lastVisitedStepId: null,
    courses: initialCourses as any
  }
}

export const loadProgress = (): ProgressState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createInitialProgress()
    }

    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const base = createInitialProgress()

    for (const course of courses) {
      const saved = parsed.courses?.[course.id]
      if (saved) {
        base.courses[course.id] = {
          ...base.courses[course.id],
          ...saved
        }
      }
    }

    return {
      ...base,
      ...parsed,
      courses: base.courses
    }
  } catch {
    return createInitialProgress()
  }
}

export const saveProgress = (progress: ProgressState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
