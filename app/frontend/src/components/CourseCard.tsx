import { motion } from 'framer-motion'
import { GraduationCap, Timer, User2 } from 'lucide-react'
import type { Course } from './CourseList'
import { Button } from './ui/Button'
import { CardContent } from './ui/Card'
import { cn } from './ui/cn'
import { formatINR, usdToInr } from '../utils/format'

function getCourseImageUrl(title: string) {
  const t = title.toLowerCase()
  if (t.includes('kubernetes')) {
    return 'https://images.unsplash.com/photo-1667372459528-2bca1c4c8d89?auto=format&fit=crop&w=1400&q=70'
  }
  if (t.includes('docker')) {
    return 'https://images.unsplash.com/photo-1629905679176-4f4b8aa7f7d2?auto=format&fit=crop&w=1400&q=70'
  }
  if (t.includes('aws') || t.includes('cloud')) {
    return 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?auto=format&fit=crop&w=1400&q=70'
  }
  if (t.includes('security')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=70'
  }
  return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=70'
}

export function CourseCard({
  course,
  onEnroll,
  enrolling,
  className,
}: {
  course: Course
  onEnroll: (courseId: string) => void
  enrolling: boolean
  className?: string
}) {
  const imageUrl = getCourseImageUrl(course.title)
  const price = formatINR(usdToInr(course.price))

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl',
        'dark:border-white/10 dark:bg-zinc-950/55 dark:shadow-[0_14px_60px_rgba(0,0,0,0.45)]',
        className,
      )}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.48),transparent_70%)]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          Course
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {price}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="min-w-0">
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
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Instructor</span>
            <span className="min-w-0 truncate">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Duration</span>
            <span>{course.duration} hours</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => onEnroll(course.id)}
            isLoading={enrolling}
            className="w-full"
            leftIcon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
          >
            Enroll
          </Button>
        </div>
      </CardContent>
    </motion.div>
  )
}

