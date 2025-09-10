import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { CourseList } from './components/CourseList';
import { EnrollmentsTable } from './components/EnrollmentsTable';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { user, logout, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'enrollments'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm isLogin={isLogin} onToggleMode={() => setIsLogin(!isLogin)} />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">CloudBlitz</h1>
                <div className="ml-10 flex items-baseline space-x-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'dashboard'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentPage('enrollments')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'enrollments'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Enrollments
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {currentPage === 'dashboard' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to CloudBlitz, {user.name}!
                  </h2>
                  <p className="text-gray-600">
                    Discover and enroll in our amazing cloud computing courses.
                  </p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Courses</h3>
                  <CourseList />
                </div>
              </div>
            )}

            {currentPage === 'enrollments' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Enrollments</h2>
                  <p className="text-gray-600">
                    Track your course progress and enrollment status.
                  </p>
                </div>
                <EnrollmentsTable />
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default App;