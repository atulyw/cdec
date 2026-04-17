import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LoginForm } from './components/LoginForm'
import { DebugPanel } from './components/DebugPanel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import type { AppPage } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { EnrollmentsPage } from './pages/EnrollmentsPage'

function App() {
  const { user, loading, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  useEffect(() => {
    console.log('[App] State changed:', { user, loading, error });
  }, [user, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-r-transparent text-brand-600 dark:border-zinc-800"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginForm isLogin={isLogin} onToggleMode={() => setIsLogin(!isLogin)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AppLayout activePage={currentPage} onNavigate={setCurrentPage}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {currentPage === 'dashboard' ? <DashboardPage /> : <EnrollmentsPage />}
            </motion.div>
          </AnimatePresence>
        </AppLayout>
        <DebugPanel />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

export default App;