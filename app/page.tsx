export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-3xl font-bold">TradeStack AI</h1>
      <p className="text-lg">AI that texts back your customers, books jobs, and keeps everything logged.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>SMS in → AI drafts reply</li>
        <li>Approve & send from your inbox</li>
        <li>Supabase-backed (secure & fast)</li>
      </ul>
      <a className="inline-block rounded bg-black px-4 py-2 text-white" href="mailto:you@example.com">
        Get Early Access
      </a>
      <p className="text-xs text-gray-500 mt-8">© {new Date().getFullYear()} TradeStack AI</p>
    </main>
  );
}
