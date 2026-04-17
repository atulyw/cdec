import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  ChevronLeft,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Sun,
  Table2,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { cn } from '../components/ui/cn'
import { AnimatedBackdrop } from '../components/visual/AnimatedBackdrop'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export type AppPage = 'dashboard' | 'enrollments'

export function AppLayout({
  activePage,
  onNavigate,
  children,
}: {
  activePage: AppPage
  onNavigate: (p: AppPage) => void
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const { resolvedTheme, toggle } = useTheme()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="relative min-h-screen">
      <AnimatedBackdrop />
      <div className="flex">
        <motion.aside
          className="sticky top-0 hidden h-screen shrink-0 lg:block"
          animate={{ width: collapsed ? 88 : 304 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-y-3 left-3 right-3 rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]" />

            <div className="relative flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-4">
                <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                    <span className="text-sm font-semibold" aria-hidden="true">
                      CB
                    </span>
                  </div>
                  {!collapsed ? (
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        CloudBlitz
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Student dashboard
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className={cn(
                    'rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                    collapsed && 'hidden',
                  )}
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={cn(
                    'rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                    !collapsed && 'hidden',
                  )}
                  onClick={() => setCollapsed(false)}
                  aria-label="Expand sidebar"
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" aria-hidden="true" />
                </button>
              </div>

              <nav className="px-3 py-2">
                <div className="space-y-1">
                  <NavItem
                    collapsed={collapsed}
                    active={activePage === 'dashboard'}
                    icon={<LayoutGrid className="h-5 w-5" aria-hidden="true" />}
                    label="Dashboard"
                    onClick={() => onNavigate('dashboard')}
                  />
                  <NavItem
                    collapsed={collapsed}
                    active={activePage === 'enrollments'}
                    icon={<Table2 className="h-5 w-5" aria-hidden="true" />}
                    label="My enrollments"
                    onClick={() => onNavigate('enrollments')}
                  />
                </div>
              </nav>

              <div className="mt-auto border-t border-white/60 p-3 dark:border-white/10">
                <div className={cn('flex items-center gap-3 px-2 py-2', collapsed && 'justify-center')}>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20">
                    <span className="text-sm font-semibold" aria-hidden="true">
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  {!collapsed ? (
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {user?.name ?? 'User'}
                      </div>
                      <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {user?.email ?? '—'}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className={cn('mt-2 flex items-center gap-2', collapsed && 'justify-center')}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('w-full justify-start', collapsed && 'w-10 justify-center px-0')}
                    leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
                    onClick={logout}
                  >
                    {!collapsed ? 'Logout' : null}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40">
            <div className="container-page flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/60 bg-white/70 text-zinc-800 shadow-sm backdrop-blur hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:bg-zinc-950/70 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {activePage === 'dashboard' ? 'Dashboard' : 'My enrollments'}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activePage === 'dashboard'
                      ? 'Browse courses and start learning.'
                      : 'Track your enrolled courses.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-white/60 bg-white/70 p-2 text-zinc-600 shadow-sm backdrop-blur hover:bg-white/80 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:bg-zinc-950/70 dark:hover:text-zinc-50"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/60 bg-white/70 p-2 text-zinc-600 shadow-sm backdrop-blur hover:bg-white/80 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:bg-zinc-950/70 dark:hover:text-zinc-50"
                  onClick={toggle}
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Moon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                <div className="hidden items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Signed in
                </div>
              </div>
            </div>
            <div className="container-page">
              <div className="h-px w-full bg-white/60 dark:bg-white/10" />
            </div>
          </header>

          <main className="container-page py-8">
            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-[0_12px_45px_rgba(0,0,0,0.40)] sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[320px] lg:hidden"
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              role="dialog"
              aria-label="Navigation"
            >
              <div className="relative h-full">
                <div className="absolute inset-y-3 left-3 right-3 rounded-2xl border border-white/60 bg-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-[0_14px_50px_rgba(0,0,0,0.45)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex h-16 items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                        <span className="text-sm font-semibold" aria-hidden="true">
                          CB
                        </span>
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          CloudBlitz
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Student dashboard
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <nav className="px-4 py-2">
                    <div className="space-y-1">
                      <NavItem
                        collapsed={false}
                        active={activePage === 'dashboard'}
                        icon={<LayoutGrid className="h-5 w-5" aria-hidden="true" />}
                        label="Dashboard"
                        onClick={() => {
                          onNavigate('dashboard')
                          setMobileOpen(false)
                        }}
                      />
                      <NavItem
                        collapsed={false}
                        active={activePage === 'enrollments'}
                        icon={<Table2 className="h-5 w-5" aria-hidden="true" />}
                        label="My enrollments"
                        onClick={() => {
                          onNavigate('enrollments')
                          setMobileOpen(false)
                        }}
                      />
                    </div>
                  </nav>

                  <div className="mt-auto border-t border-white/60 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20">
                        <span className="text-sm font-semibold" aria-hidden="true">
                          {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {user?.name ?? 'User'}
                        </div>
                        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {user?.email ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
                        onClick={logout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function NavItem({
  active,
  icon,
  label,
  collapsed,
  onClick,
}: {
  active?: boolean
  icon: React.ReactNode
  label: string
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20'
          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
        collapsed && 'justify-center px-0',
      )}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </button>
  )
}

