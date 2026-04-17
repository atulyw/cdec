import React, { useEffect, useMemo, useState } from 'react'
import { BookOpen, CheckCircle2, CircleSlash, Clock3 } from 'lucide-react'
import { enrollApi } from '../utils/api'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { cn } from './ui/cn'

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export const EnrollmentsTable: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollApi.get<Enrollment[]>('/');
      console.log('[EnrollmentsTable] GET / enroll response:', response)
      if (response.success && response.data) {
        setEnrollments(response.data);
      } else {
        setError(response.error || 'Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('[EnrollmentsTable] Failed to fetch enrollments:', error)
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Enrollment['status']) => {
    switch (status) {
      case 'active':
        return <Clock3 className="h-4 w-4" aria-hidden="true" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      case 'cancelled':
        return <CircleSlash className="h-4 w-4" aria-hidden="true" />
      default:
        return <BookOpen className="h-4 w-4" aria-hidden="true" />
    }
  };

  const getStatusTone = (status: Enrollment['status']) => {
    switch (status) {
      case 'active':
        return 'success' as const
      case 'completed':
        return 'info' as const
      case 'cancelled':
        return 'danger' as const
      default:
        return 'default' as const
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const summary = useMemo(() => {
    const total = enrollments.length
    const active = enrollments.filter((e) => e.status === 'active').length
    const completed = enrollments.filter((e) => e.status === 'completed').length
    return { total, active, completed }
  }, [enrollments])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-8 w-16" />
                <Skeleton className="mt-3 h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Course enrollments</CardTitle>
            <CardDescription>Track your learning progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="mt-2 h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Failed to load enrollments
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={fetchEnrollments} variant="primary">
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            No enrollments yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enroll in a course from the Dashboard to see it here.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total enrollments</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Course enrollments</CardTitle>
          <CardDescription>Track your learning progress and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50',
                'dark:border-zinc-800 dark:hover:bg-zinc-900/30 sm:flex-row sm:items-center sm:justify-between',
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {enrollment.courseTitle}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Enrolled on {formatDate(enrollment.enrolledAt)}
                </div>
              </div>
              <Badge tone={getStatusTone(enrollment.status)} className="w-fit">
                {getStatusIcon(enrollment.status)}
                <span className="capitalize">{enrollment.status}</span>
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
