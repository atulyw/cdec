import React, { useEffect, useState } from 'react'
import { GraduationCap, Timer, User2 } from 'lucide-react'
import { courseApi, enrollApi } from '../utils/api'
import { formatINR, usdToInr } from '../utils/format'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { useToast } from '../contexts/ToastContext'

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  price: number;
}

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseApi.get<Course[]>('/');
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setError(response.error || 'Failed to fetch courses');
      }
    } catch (error) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      const response = await enrollApi.post<{ message: string }>('/', { courseId });
      if (response.success) {
        toast({ tone: 'success', title: 'Enrollment successful', description: 'You’re enrolled in the course.' })
      } else {
        toast({ tone: 'error', title: 'Enrollment failed', description: response.error || 'Please try again.' })
      }
    } catch (error) {
      toast({ tone: 'error', title: 'Enrollment failed', description: 'Network error. Please try again.' })
    } finally {
      setEnrolling(null);
    }
  };

  const getCourseIcon = (title: string) => {
    if (title.toLowerCase().includes('aws')) return '☁️';
    if (title.toLowerCase().includes('docker')) return '🐳';
    if (title.toLowerCase().includes('kubernetes')) return '⚙️';
    return '📚';
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="text-right">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="mt-2 h-4 w-14" />
                </div>
              </div>
              <Skeleton className="mt-5 h-5 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-6 h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Failed to load courses
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={fetchCourses} variant="primary">
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-0 sm:grid-cols-[240px_1fr]">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=60"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-48 w-full object-cover sm:h-full"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)] sm:bg-[linear-gradient(to_right,rgba(0,0,0,0.35),transparent)]" />
            </div>
            <div className="p-8">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                No courses available
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Courses will appear here once they’re published. Try refreshing in a moment.
              </p>
              <div className="mt-6 flex gap-2">
                <Button onClick={fetchCourses} variant="primary">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="group overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="relative">
            <img
              src={`https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=60`}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)]" />
            <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-zinc-900 shadow-sm backdrop-blur dark:bg-zinc-950/70 dark:text-zinc-50">
              <span className="text-lg" aria-hidden="true">
                {getCourseIcon(course.title)}
              </span>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="text-right">
                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatINR(usdToInr(course.price))}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">One-time</div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {course.description}
              </p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Instructor:</span>
                <span className="truncate">{course.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Duration:</span>
                <span>{course.duration} hours</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => handleEnroll(course.id)}
                isLoading={enrolling === course.id}
                className="w-full"
                leftIcon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
              >
                Enroll
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
