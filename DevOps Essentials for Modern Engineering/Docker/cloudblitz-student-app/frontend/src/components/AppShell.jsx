import { GraduationCap, LayoutDashboard, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
];

function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/60 bg-white/70 backdrop-blur-xl lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-blue-500/30">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                  CloudBlitz
                </p>
                <h1 className="text-base font-semibold text-slate-900">
                  Student App
                </h1>
              </div>
            </Link>

            <div className="mt-10 space-y-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto rounded-3xl border border-white/70 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-2xl shadow-slate-900/20"
            >
              <div className="mb-3 inline-flex rounded-full bg-white/10 p-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Modern student workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Manage your student records with a clean dashboard layout and a
                better user experience.
              </p>
            </motion.div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  SaaS Dashboard
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  CloudBlitz Student App
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm md:block">
                  Simple, clean and production-style UI
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-sm font-semibold text-white shadow-lg shadow-orange-300/40">
                  CB
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
