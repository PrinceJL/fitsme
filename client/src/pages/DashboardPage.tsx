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
          Phase 1 complete: authentication is wired end-to-end. Photo upload and body
          measurement estimation land in Phase 2.
        </p>
      </main>
    </div>
  );
}
