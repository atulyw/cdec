import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Mail, Sparkles, User } from "lucide-react";

const initialFormState = {
  name: "",
  email: "",
  course: "",
};

function StudentForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Simple beginner-friendly validation before calling the API
    if (!formData.name || !formData.email || !formData.course) {
      setFormError("Please fill in all fields.");
      return;
    }

    setFormError("");
    const result = await onSubmit(formData);

    if (result?.success) {
      setFormData(initialFormState);
    } else if (result?.message) {
      setFormError(result.message);
    }
  };

  const inputClassName =
    "peer w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-4 pt-6 pb-2 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-transparent focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Add Student</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fill out the form and save a new student.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
          Quick Create
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="relative block">
          <User className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Student name"
            className={inputClassName}
          />
          <span className="pointer-events-none absolute left-12 top-3 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
            Name
          </span>
        </label>

        <label className="relative block">
          <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Student email"
            className={inputClassName}
          />
          <span className="pointer-events-none absolute left-12 top-3 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
            Email
          </span>
        </label>

        <label className="relative block">
          <BookOpenText className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Course name"
            className={inputClassName}
          />
          <span className="pointer-events-none absolute left-12 top-3 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
            Course
          </span>
        </label>

        {formError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </p>
        ) : null}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-3.5 font-medium text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Add Student"}
        </motion.button>
      </form>
    </motion.div>
    
  );
}

export default StudentForm;
