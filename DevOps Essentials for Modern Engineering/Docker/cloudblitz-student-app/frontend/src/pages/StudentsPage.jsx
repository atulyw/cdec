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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Students</h1>
        <p className="mt-2 text-slate-600">
          Add a student, view all students, or delete one from the list.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
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
