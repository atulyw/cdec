import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-r-transparent text-brand-600 dark:border-zinc-800"
          aria-label="Loading"
          role="status"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Access denied</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You need to be logged in to access this page.
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => window.location.reload()} variant="primary">
                Go to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
