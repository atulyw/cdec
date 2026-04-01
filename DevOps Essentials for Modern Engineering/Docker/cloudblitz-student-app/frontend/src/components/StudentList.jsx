import StudentItem from "./StudentItem";

function StudentList({ students, isLoading, onDelete }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-500">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Student List</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          {students.length} total
        </span>
      </div>

      {students.length === 0 ? (
        <p className="text-slate-500">No students added yet.</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <StudentItem
              key={student.id}
              student={student}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentList;
