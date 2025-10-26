// app/components/CreateBooking.tsx
"use client";

import { useState } from "react";

export default function CreateBooking({
  customerPhone,
  channelId,
}: { customerPhone: string; channelId: string }) {
  const [service, setService] = useState("");
  const [when, setWhen] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);

  async function onCreate() {
    if (!service || !when) return;
    setSending(true);
    setDone(null);
    try {
      // 1) create booking
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: channelId,
          customer_phone: customerPhone,
          service,
          starts_at: new Date(when).toISOString(),
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("create failed");
      const { booking } = await res.json();

      // 2) magic link + SMS to customer
      const link = `${window.location.origin}/book/${booking.public_token}`;
      const niceWhen = new Date(booking.starts_at).toLocaleString();
      const body = `Got it! To confirm your ${service} on ${niceWhen}, tap: ${link}`;

      const send = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customerPhone, body, channel_id: channelId }),
      });
      if (!send.ok) throw new Error("sms failed");

      setDone("ok");
      setService("");
      setWhen("");
    } catch {
      setDone("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-gray-600">Create booking</div>
      <input
        className="mb-2 w-full rounded-lg border p-2"
        placeholder="Service (e.g., Basic Detail)"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <input
        className="mb-2 w-full rounded-lg border p-2"
        type="datetime-local"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
      />
      <button
        onClick={onCreate}
        disabled={!service || !when || sending}
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {sending ? "Creating…" : "Create & Text Link"}
      </button>
      {done === "ok" && <div className="mt-2 text-sm text-green-700">Sent ✔</div>}
      {done === "err" && <div className="mt-2 text-sm text-red-600">Something went wrong</div>}
    </div>
  );
}
