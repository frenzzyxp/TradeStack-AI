"use client";

import { useState } from "react";

type Props = {
  to: string;
  channelId: string;
  initialText?: string;
};

export default function ReplyBox({ to, channelId, initialText = "" }: Props) {
  const [text, setText] = useState(initialText);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle"|"ok"|"err">("idle");

  async function onSend() {
    if (!text.trim()) return;
    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body: text, channel_id: channelId }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border bg-white p-3">
      <div className="text-xs font-semibold text-gray-600 mb-1">Reply</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type your reply…"
        className="w-full rounded-lg border p-2 outline-none focus:ring"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={onSend}
          disabled={sending || !text.trim()}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
        {status === "ok" && <span className="text-sm text-green-700">Sent ✔</span>}
        {status === "err" && <span className="text-sm text-red-600">Failed to send</span>}
      </div>
    </div>
  );
}
