// app/inbox/page.tsx
import { supabaseService } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic"; // always fetch fresh data on each request

export default async function InboxPage() {
  const sb = supabaseService();

  // Get latest 50 messages
  const { data: messages, error: mErr } = await sb
    .from("messages")
    .select("id, created_at, from_number, to_number, body, channel_id, direction, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (mErr) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="mt-2 text-red-600">Error loading messages: {mErr.message}</p>
      </main>
    );
  }

  // Get all AI suggestions for those messages
  const ids = (messages ?? []).map((m) => m.id);
  let byMessageId = new Map<string, string>();
  if (ids.length) {
    const { data: suggestions } = await sb
      .from("ai_suggestions")
      .select("message_id, suggestion_text")
      .in("message_id", ids);

    byMessageId = new Map(
      (suggestions ?? []).map((s) => [s.message_id as string, s.suggestion_text as string])
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-gray-500">Latest {messages?.length ?? 0} messages</p>
        </div>
      </header>

      {!messages?.length && (
        <p className="text-gray-600">No messages yet — text your Twilio number to see items here.</p>
      )}

      <ul className="space-y-4">
        {messages?.map((m) => {
          const suggestion = byMessageId.get(m.id);
          const when = new Date(m.created_at).toLocaleString();
          const dirBadge =
            m.direction === "out" ? (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">out</span>
            ) : (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">in</span>
            );

          return (
            <li key={m.id} className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {dirBadge}
                <span>{when}</span>
                {m.status && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{m.status}</span>}
              </div>

              <div className="mt-1 text-sm text-gray-700">
                <span className="font-medium">{m.from_number}</span> →{" "}
                <span className="font-medium">{m.to_number}</span>
              </div>

              <div className="mt-2 whitespace-pre-wrap">{m.body}</div>

              {suggestion && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <div className="mb-1 font-semibold">AI suggestion</div>
                  <div className="whitespace-pre-wrap">{suggestion}</div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
