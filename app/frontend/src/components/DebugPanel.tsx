import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const DebugPanel: React.FC = () => {
  const { user, loading, error } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Panel"
      >
        🐛
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <strong>Auth State:</strong>
              <div className="ml-2 mt-1">
                <div>Loading: {loading ? '✅' : '❌'}</div>
                <div>User: {user ? '✅' : '❌'}</div>
                <div>Error: {error ? '✅' : '❌'}</div>
              </div>
            </div>

            {user && (
              <div>
                <strong>User Data:</strong>
                <pre className="ml-2 mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}

            {error && (
              <div>
                <strong>Error:</strong>
                <div className="ml-2 mt-1 text-red-600">{error}</div>
              </div>
            )}

            <div>
              <strong>Token:</strong>
              <div className="ml-2 mt-1">
                {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
              </div>
            </div>

            <div>
              <strong>Environment:</strong>
              <div className="ml-2 mt-1">
                <div>AUTH_API: {import.meta.env.VITE_AUTH_API || 'undefined'}</div>
                <div>COURSE_API: {import.meta.env.VITE_COURSE_API || 'undefined'}</div>
                <div>ENROLL_API: {import.meta.env.VITE_ENROLL_API || 'undefined'}</div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
