import { motion } from "framer-motion";
import { ArrowRight, Layers3, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-8 text-white shadow-2xl shadow-blue-900/20 lg:p-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Modern student management experience
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              A polished dashboard for managing student records.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Add students, explore the list, and keep your records organized in
              a clean SaaS-style interface designed to feel modern and calm.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/students"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm text-slate-200 backdrop-blur">
                Clean layout, subtle motion, better UX
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-2xl shadow-slate-200/60 backdrop-blur"
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Students studying together"
            className="h-full min-h-[320px] w-full rounded-[1.5rem] object-cover"
          />
        </motion.div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Dashboard-first layout",
            description: "A clearer interface with better spacing and stronger visual hierarchy.",
            icon: Layers3,
          },
          {
            title: "Student-focused design",
            description: "Cards, avatars and readable details make records easier to scan quickly.",
            icon: Users,
          },
          {
            title: "Modern experience",
            description: "Soft gradients, motion and clean surfaces make the app feel more premium.",
            icon: Sparkles,
          },
        ].map(({ title, description, icon: Icon }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
