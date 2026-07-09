import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-lg font-semibold text-brand-600">FitsMe</h1>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome{user?.full_name ? `, ${user.full_name}` : ''} 👋
        </h2>
        <p className="mt-2 text-gray-500">
          Upload a couple of photos and we'll estimate your body measurements.
        </p>
        <Link
          to="/measurements"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Get my measurements
        </Link>
      </main>
    </div>
  );
}
