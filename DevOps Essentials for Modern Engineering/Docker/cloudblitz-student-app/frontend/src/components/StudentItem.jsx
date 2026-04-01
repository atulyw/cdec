function StudentItem({ student, onDelete }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
        <p className="text-sm text-slate-600">{student.email}</p>
        <p className="mt-1 text-sm text-slate-500">Course: {student.course}</p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(student.id)}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </article>
  );
}

export default StudentItem;
