import { EnrollmentsTable } from '../components/EnrollmentsTable'

export function EnrollmentsPage() {
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
      <EnrollmentsTable />
    </div>
  )
}

