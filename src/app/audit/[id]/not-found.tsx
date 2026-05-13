import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-6">◈</p>
        <h1 className="text-2xl font-bold mb-3">Audit not found</h1>
        <p className="text-[#6b8c82] mb-8">
          This audit link may have expired or the ID is incorrect.
        </p>
        <Link
          href="/"
          className="btn-primary inline-block"
        >
          Run a new audit →
        </Link>
      </div>
    </main>
  );
}