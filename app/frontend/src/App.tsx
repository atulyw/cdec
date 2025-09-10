import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { CourseList } from './components/CourseList';
import { EnrollmentsTable } from './components/EnrollmentsTable';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DebugPanel } from './components/DebugPanel';

function App() {
  const { user, logout, loading, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'enrollments'>('dashboard');

  useEffect(() => {
    console.log('[App] State changed:', { user, loading, error });
  }, [user, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading CloudBlitz...</p>
        </div>
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
        <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="container">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">⚡</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">CloudBlitz</h1>
                </div>
                <div className="ml-10 flex items-baseline space-x-1">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 'dashboard'
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentPage('enrollments')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 'enrollments'
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    My Enrollments
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Welcome, {user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container section">
          {currentPage === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Continue your cloud computing journey with our expertly crafted courses designed to accelerate your learning.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="card p-6 text-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Courses</h3>
                  <p className="text-3xl font-bold text-primary-600">3</p>
                </div>
                <div className="card p-6 text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="card p-6 text-center">
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">In Progress</h3>
                  <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
              </div>

              {/* Courses Section */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Courses</h2>
                    <p className="text-gray-600">Explore our comprehensive cloud computing curriculum</p>
                  </div>
                </div>
                <CourseList />
              </div>
            </div>
          )}

          {currentPage === 'enrollments' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My Enrollments</h1>
                <p className="text-lg text-gray-600">
                  Track your course progress and manage your learning journey.
                </p>
              </div>
              <EnrollmentsTable />
            </div>
          )}
        </main>
        </div>
        <DebugPanel />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

export default App;