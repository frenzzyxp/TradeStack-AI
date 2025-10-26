// app/bookings/page.tsx
import { supabaseService } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

async function updateBooking(formData: FormData) {
  "use server";
  const sb = supabaseService();
  const id = String(formData.get("id"));
  const starts_at = String(formData.get("starts_at"));
  const status = String(formData.get("status"));
  const notes = String(formData.get("notes") || "");
  await sb.from("bookings").update({ starts_at, status, notes }).eq("id", id);
}

export default async function BookingsPage() {
  const sb = supabaseService();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const { data: todays } = await sb
    .from("bookings")
    .select("*")
    .gte("starts_at", startOfToday.toISOString())
    .lte("starts_at", endOfToday.toISOString())
    .order("starts_at", { ascending: true });

  const { data: upcoming } = await sb
    .from("bookings")
    .select("*")
    .gt("starts_at", endOfToday.toISOString())
    .lte("starts_at", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true });

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-sm text-gray-500">View and edit upcoming appointments.</p>
      </section>

      <Section title="Today" rows={todays ?? []} />
      <Section title="Upcoming (30 days)" rows={upcoming ?? []} />
    </main>
  );
}

function Section({ title, rows }: { title: string; rows: any[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {!rows.length && <div className="rounded-xl border bg-white p-4 text-gray-600">None</div>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((b) => (
          <BookingCard key={b.id} b={b} />
        ))}
      </ul>
    </div>
  );
}

function BookingCard({ b }: { b: any }) {
  const iso = new Date(b.starts_at).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  const when = new Date(b.starts_at).toLocaleString();

  return (
    <li className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-600">{when}</div>
      <div className="mt-1 text-sm">
        <span className="font-semibold">{b.customer_name ?? b.customer_phone}</span>
      </div>
      <div className="text-sm text-gray-700">{b.service}</div>
      {b.notes && <div className="mt-2 text-xs text-gray-500">{b.notes}</div>}

      <form action={updateBooking} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={b.id} />
        <label className="block text-xs font-semibold text-gray-600">Start</label>
        <input className="w-full rounded-lg border p-2" type="datetime-local" name="starts_at" defaultValue={iso} required />

        <label className="block text-xs font-semibold text-gray-600">Status</label>
        <select name="status" defaultValue={b.status} className="w-full rounded-lg border p-2">
          <option>pending</option>
          <option>confirmed</option>
          <option>completed</option>
          <option>cancelled</option>
          <option>no_show</option>
        </select>

        <label className="block text-xs font-semibold text-gray-600">Notes</label>
        <textarea name="notes" defaultValue={b.notes ?? ""} className="w-full rounded-lg border p-2" rows={2} />

        <button className="mt-2 rounded-lg bg-black px-3 py-2 text-white">Save</button>
      </form>
    </li>
  );
}
