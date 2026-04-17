import { BookOpen, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { CourseList } from '../components/CourseList'
import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Welcome back
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Hi {user?.name ?? 'there'}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Browse available courses and enroll in seconds. Your progress and enrollments stay organized in one place.
            </p>
          </div>
          <div className="hidden h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white shadow-sm sm:grid">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available courses</CardTitle>
            <CardDescription>What you can start today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">3</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Curated cloud curriculum</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Courses you’ve finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">0</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Keep going—small wins add up</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In progress</CardTitle>
            <CardDescription>Courses you’re currently taking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">0</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Start a course to see it here</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Courses</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Explore the catalog and enroll when you’re ready.
          </p>
        </div>
      </div>

      <CourseList />
    </div>
  )
}

