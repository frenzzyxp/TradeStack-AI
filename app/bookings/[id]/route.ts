// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const sb = supabaseService();

    const { data, error } = await sb
      .from("bookings")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (e: any) {
    console.error("update booking error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
