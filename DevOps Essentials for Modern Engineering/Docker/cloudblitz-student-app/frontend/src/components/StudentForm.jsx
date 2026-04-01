import { useState } from "react";

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

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">Add Student</h2>
      <p className="mt-1 text-sm text-slate-500">
        Fill out the form and save a new student.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Name
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter student email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Course
          </span>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter course name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </label>

        {formError ? (
          <p className="text-sm text-red-600">{formError}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Saving..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}

export default StudentForm;
