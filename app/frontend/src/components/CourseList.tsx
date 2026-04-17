import React, { useEffect, useState } from 'react'
import { courseApi, enrollApi } from '../utils/api'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { CourseCard } from './CourseCard'

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
      <div className="mx-auto max-w-3xl rounded-2xl bg-[linear-gradient(135deg,rgba(57,160,255,0.70),rgba(184,75,255,0.55),rgba(34,255,153,0.35))] p-px">
        <div className="overflow-hidden rounded-[15px] border border-white/10 bg-zinc-950/70 backdrop-blur-xl">
          <div className="grid gap-0 sm:grid-cols-[260px_1fr]">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=70"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-52 w-full object-cover opacity-90 sm:h-full"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,7,13,0.92),transparent)] sm:bg-[linear-gradient(to_right,rgba(5,7,13,0.92),transparent)]" />
            </div>
            <div className="p-8">
              <h3 className="text-display text-lg font-semibold text-zinc-50">
                No courses available
              </h3>
              <p className="mt-2 text-sm text-zinc-300/80">
                Courses will appear here once they’re published. Refresh to re-check the catalog.
              </p>
              <div className="mt-6 flex gap-2">
                <Button onClick={fetchCourses} variant="primary">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
    >
      <AnimatePresence initial={false}>
        {courses.map((course) => (
          <motion.div
            key={course.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
            }}
            layout
          >
            <CourseCard
              course={course}
              onEnroll={handleEnroll}
              enrolling={enrolling === course.id}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
