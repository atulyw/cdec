import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="max-w-2xl">
        <p className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          Beginner-friendly React frontend
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
          Manage students with a simple and clean dashboard
        </h1>
        <p className="mb-6 text-lg text-slate-600">
          This frontend lets you add students, see the full list, and remove a
          student when needed.
        </p>
        <Link
          to="/students"
          className="inline-flex rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          Open Students Page
        </Link>
      </div>
    </section>
  );
}

export default HomePage;
