// app/book/[token]/page.tsx
import { supabaseService } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";

async function confirmBooking(id: string) {
  "use server";
  const sb = supabaseService();
  await sb.from("bookings").update({ status: "confirmed" }).eq("id", id);
}

export default async function BookTokenPage({ params }: { params: { token: string } }) {
  const sb = supabaseService();
  const { data: b } = await sb
    .from("bookings")
    .select("*")
    .eq("public_token", params.token)
    .single();

  if (!b) return notFound();

  const when = new Date(b.starts_at).toLocaleString();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Confirm your appointment</h1>
      <p className="mt-2 text-gray-600">
        {b.service} on <strong>{when}</strong>
      </p>

      <form action={async () => confirmBooking(b.id)} className="mt-6">
        <button className="rounded-xl bg-black px-4 py-2 text-white">Confirm</button>
      </form>
      <p className="mt-3 text-xs text-gray-500">Having trouble? Reply to the text and we’ll help.</p>
    </main>
  );
}
