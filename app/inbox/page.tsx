// app/inbox/page.tsx
import { supabaseService } from "@/lib/supabaseServer";
import ReplyBox from "@/app/components/ReplyBox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const sb = supabaseService();

  const { data: messages, error: mErr } = await sb
    .from("messages")
    .select("id, created_at, from_number, to_number, body, channel_id, direction, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (mErr) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="mt-2 text-red-600">Error: {mErr.message}</p>
      </main>
    );
  }

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
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="sticky top-0 z-10 -mx-6 border-b bg-gray-50/80 backdrop-blur">
        <div className="mx-auto max-w-4xl p-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-sm text-gray-500">
            Latest {messages?.length ?? 0} messages · Auto-saved in Supabase
          </p>
        </div>
      </header>

      {!messages?.length && (
        <div className="rounded-xl border bg-white p-6 text-gray-600">
          No messages yet — text your Twilio number to see items here.
        </div>
      )}

      <ul className="space-y-4">
        {messages?.map((m) => {
          const suggestion = byMessageId.get(m.id) || "";
          const when = new Date(m.created_at).toLocaleString();
          const dir =
            m.direction === "out"
              ? "text-blue-800 bg-blue-100"
              : "text-green-800 bg-green-100";

          return (
            <li key={m.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className={`rounded px-2 py-0.5 text-xs ${dir}`}>
                  {m.direction ?? "in"}
                </span>
                <span>{when}</span>
                {m.status && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{m.status}</span>
                )}
              </div>

              <div className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">{m.from_number}</span> →{" "}
                <span className="font-semibold">{m.to_number}</span>
              </div>

              <div className="mt-3 whitespace-pre-wrap">{m.body}</div>

              {suggestion && (
                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="mb-1 font-semibold">AI suggestion</div>
                  <div className="whitespace-pre-wrap">{suggestion}</div>
                </div>
              )}

              {/* Reply box, defaults to AI suggestion text */}
              <ReplyBox to={m.from_number} channelId={m.channel_id} initialText={suggestion} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
