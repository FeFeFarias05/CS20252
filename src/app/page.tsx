export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome to Sprint 0 App</h1>
      <p className="text-gray-700">
        This project exposes a REST API under <code>/api/users</code> for
        creating, reading, updating and deleting users.
      </p>
    </main>
  );
}