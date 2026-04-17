import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
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

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(x, { stiffness: 220, damping: 22 })
  const rotateY = useSpring(y, { stiffness: 220, damping: 22 })
  const rX = useMotionTemplate`${rotateX}deg`
  const rY = useMotionTemplate`${rotateY}deg`

  const isTouch = React.useRef(false)

  return (
    <motion.div
      className={cn(
        'group relative rounded-2xl p-px',
        'bg-[linear-gradient(135deg,rgba(57,160,255,0.70),rgba(184,75,255,0.55),rgba(34,255,153,0.40))]',
        'shadow-[0_18px_80px_rgba(0,0,0,0.60)]',
        className,
      )}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      style={{ transformStyle: 'preserve-3d', perspective: 900, rotateX: rX, rotateY: rY }}
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') isTouch.current = true
      }}
      onPointerMove={(e) => {
        if (isTouch.current) return
        const el = e.currentTarget as HTMLDivElement
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        x.set((0.5 - py) * 8)
        y.set((px - 0.5) * 10)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
        isTouch.current = false
      }}
    >
      <div className="relative overflow-hidden rounded-[15px] border border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(28rem_14rem_at_top,rgba(57,160,255,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(24rem_14rem_at_bottom,rgba(184,75,255,0.12),transparent_65%)]" />
        </div>

        <div className="relative">
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-36 w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,7,13,0.92),rgba(5,7,13,0.20),transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(57,160,255,0.18),transparent_38%,rgba(184,75,255,0.14))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-100 backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5 text-[color:var(--color-neon-blue)]" aria-hidden="true" />
            Course
          </div>
          <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-100 backdrop-blur">
            {price}
          </div>
        </div>

        <CardContent className="relative p-6">
          <div className="min-w-0">
            <h3 className="text-display line-clamp-2 text-base font-semibold text-zinc-50">
              {course.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300/90">
              {course.description}
            </p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-zinc-300/80">
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <span className="font-medium text-zinc-200">Instructor</span>
              <span className="min-w-0 truncate">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <span className="font-medium text-zinc-200">Duration</span>
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
      </div>
    </motion.div>
  )
}

