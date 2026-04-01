import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import StudentItem from "./StudentItem";

function StudentList({ students, isLoading, onDelete }) {
  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-full bg-slate-200" />
          <div className="h-28 rounded-3xl bg-slate-100" />
          <div className="h-28 rounded-3xl bg-slate-100" />
          <div className="h-28 rounded-3xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-3 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Student Directory</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse all student records in a cleaner card layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            Search-ready layout
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-slate-900/10">
          {students.length} total
          </span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
          <p className="text-lg font-medium text-slate-700">No students added yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Use the form on the left to add your first student.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-4 xl:grid-cols-2"
        >
          {students.map((student, index) => (
            <StudentItem
              key={student.id}
              student={student}
              onDelete={onDelete}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default StudentList;
