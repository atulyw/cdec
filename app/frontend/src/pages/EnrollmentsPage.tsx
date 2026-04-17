import { BookOpen } from 'lucide-react'
import { EnrollmentsTable } from '../components/EnrollmentsTable'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export function EnrollmentsPage({ onBrowseCourses }: { onBrowseCourses?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          My enrollments
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Track your enrolled courses and current status.
        </p>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-0 sm:grid-cols-[260px_1fr]">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=60"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-44 w-full object-cover sm:h-full"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)] sm:bg-[linear-gradient(to_right,rgba(0,0,0,0.35),transparent)]" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Tip
              </div>
              <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Not seeing courses here?
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                This page shows <span className="font-medium">your enrollments</span>. To browse and enroll in courses,
                go to the Dashboard.
              </p>
              <div className="mt-5 flex gap-2">
                <Button onClick={onBrowseCourses} variant="primary">
                  Browse courses
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EnrollmentsTable />
    </div>
  )
}

