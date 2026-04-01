import { motion } from "framer-motion";
import { BookOpenText, Mail, Trash2 } from "lucide-react";
import { getAvatarUrl } from "../utils/getAvatarUrl";

function StudentItem({ student, onDelete, index = 0 }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white to-slate-50 p-5 shadow-lg shadow-slate-200/50 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={getAvatarUrl(student.name)}
            alt={student.name}
            className="h-14 w-14 rounded-2xl object-cover shadow-md"
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-600">
              Active Student
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onDelete(student.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </motion.button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Mail className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">{student.email}</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <BookOpenText className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">{student.course}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default StudentItem;
