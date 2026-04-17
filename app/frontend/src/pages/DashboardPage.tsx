import { BookOpen, Sparkles } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HealthCard } from '../components/HealthCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { CourseList } from '../components/CourseList'
import { useAuth } from '../contexts/AuthContext'
import { useCountUp } from '../hooks/useCountUp'
import { useHealthCheck } from '../hooks/useHealthCheck'

const activityData = [
  { day: 'Mon', minutes: 12 },
  { day: 'Tue', minutes: 24 },
  { day: 'Wed', minutes: 18 },
  { day: 'Thu', minutes: 30 },
  { day: 'Fri', minutes: 22 },
  { day: 'Sat', minutes: 35 },
  { day: 'Sun', minutes: 28 },
]

export function DashboardPage() {
  const { user } = useAuth()
  const availableCourses = 3
  const completed = 0
  const inProgress = 0
  const availableN = useCountUp(availableCourses)
  const completedN = useCountUp(completed)
  const inProgressN = useCountUp(inProgress)
  const { services, refresh } = useHealthCheck({ pollMs: 30_000, timeoutMs: 5_000 })

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/55 dark:shadow-[0_14px_60px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_20rem_at_top,rgba(37,99,235,0.18),transparent)] dark:bg-[radial-gradient(60rem_20rem_at_top,rgba(59,130,246,0.16),transparent)]" />
        <img
          src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=60"
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute right-[-120px] top-[-60px] hidden h-[240px] w-[420px] rotate-6 rounded-2xl object-cover opacity-30 shadow-xl sm:block"
        />
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
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(availableN)}
            </div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Curated cloud curriculum</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Courses you’ve finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(completedN)}
            </div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Keep going—small wins add up</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In progress</CardTitle>
            <CardDescription>Courses you’re currently taking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(inProgressN)}
            </div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Start a course to see it here</div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Learning activity</CardTitle>
          <CardDescription>Last 7 days (sample data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(10px)',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="rgb(37 99 235)"
                  strokeWidth={2}
                  fill="url(#brandFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Service health</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Live status from each service’s <span className="font-medium">/health</span> endpoint.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:bg-zinc-950/70"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {services.map((s) => (
          <HealthCard key={s.key} service={s} />
        ))}
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

