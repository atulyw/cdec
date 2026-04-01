import { motion } from "framer-motion";
import { BookOpen, PlusCircle, Users } from "lucide-react";
import StudentForm from "../components/StudentForm";
import StudentList from "../components/StudentList";
import { useStudents } from "../hooks/useStudents";

function StudentsPage() {
  const {
    students,
    isLoading,
    isSubmitting,
    error,
    addStudent,
    removeStudent,
  } = useStudents();

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Student workspace
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Manage your students beautifully
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Add a student, view all students, or delete one from the list.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Students",
              value: students.length,
              icon: Users,
            },
            {
              label: "Courses",
              value: new Set(students.map((student) => student.course)).size,
              icon: BookOpen,
            },
            {
              label: "Ready to add",
              value: "+1",
              icon: PlusCircle,
            },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-lg shadow-slate-200/50 backdrop-blur"
            >
              <div className="mb-3 inline-flex rounded-2xl bg-slate-100 p-2 text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm"
        >
          {error}
        </motion.div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <StudentForm onSubmit={addStudent} isSubmitting={isSubmitting} />
        <StudentList
          students={students}
          isLoading={isLoading}
          onDelete={removeStudent}
        />
      </div>
    </section>
  );
}

export default StudentsPage;
